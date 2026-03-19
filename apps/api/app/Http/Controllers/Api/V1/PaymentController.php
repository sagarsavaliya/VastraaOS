<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RefundPaymentRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\VoidPaymentRequest;
use App\Http\Resources\PaymentReceiptResource;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\OrderNumberSequence;
use App\Models\Payment;
use App\Models\PaymentReceipt;
use App\Services\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function __construct(private readonly BillingService $billingService)
    {
    }

    /**
     * List payments with optional filters. Paginated.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()
            ->with(['order.customer', 'invoice', 'receipts']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                    ->orWhere('transaction_reference', 'like', "%{$search}%")
                    ->orWhereHas('order.customer', fn($q) => $q->where('display_name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        if ($request->filled('payment_mode')) {
            $query->where('payment_mode', $request->payment_mode);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        $query->orderBy('payment_date', 'desc');

        $payments = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Payments retrieved successfully',
            'data'    => PaymentResource::collection($payments)->response()->getData(true),
        ]);
    }

    /**
     * Record a new payment.
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $order          = Order::with(['invoices', 'paymentSummary'])->findOrFail($validated['order_id']);
            $paymentSummary = $order->paymentSummary;

            // Validate payment does not exceed outstanding amount
            // When invoice_id is provided, validate against invoice's own outstanding balance
            // (draft invoices aren't counted in OrderPaymentSummary yet)
            if (!empty($validated['invoice_id'])) {
                $invoice = \App\Models\Invoice::findOrFail($validated['invoice_id']);
                $alreadyPaid = \App\Models\Payment::where('invoice_id', $invoice->id)
                    ->whereIn('status', ['completed'])
                    ->sum('amount');
                $pendingAmount = (float) $invoice->grand_total - (float) $alreadyPaid;
            } else {
                $pendingAmount = $paymentSummary?->pending_amount ?? $order->total_amount ?? 0;
            }

            if ((float) $validated['amount'] > (float) $pendingAmount + 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment amount exceeds outstanding balance (₹' . number_format($pendingAmount, 2) . ')',
                    'data'    => null,
                ], 422);
            }

            // Determine if this is an advance payment
            $isAdvance = (bool) ($validated['advance_payment'] ?? false);
            if (!$isAdvance && !$validated['invoice_id']) {
                $hasIssuedInvoice = $order->invoices()->whereIn('status', ['issued', 'paid'])->exists();
                if (!$hasIssuedInvoice) {
                    $isAdvance = true;
                }
            }

            $payment = Payment::create([
                'tenant_id'             => app('tenant_id'),
                'order_id'              => $order->id,
                'customer_id'           => $order->customer_id,
                'invoice_id'            => $validated['invoice_id'] ?? null,
                'payment_number'        => $this->generatePaymentNumber(),
                'amount'                => $validated['amount'],
                'payment_mode'          => $validated['payment_mode'],
                'payment_date'          => $validated['payment_date'],
                'transaction_reference' => $validated['transaction_reference'] ?? null,
                'cheque_number'         => $validated['cheque_number'] ?? null,
                'cheque_date'           => $validated['cheque_date'] ?? null,
                'bank_name'             => $validated['bank_name'] ?? null,
                'notes'                 => $validated['notes'] ?? null,
                'advance_payment'       => $isAdvance,
                'status'                => 'completed',
                'received_by_user_id'   => $request->user()->id,
            ]);

            $this->billingService->recalculateOrderPaymentSummary($order);

            if ($payment->invoice_id) {
                $this->billingService->recalculateInvoicePaymentStatus($payment->invoice);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data'    => new PaymentResource($payment->load(['order.customer', 'invoice', 'receipts'])),
            ], 201);
        });
    }

    /**
     * Show a single payment.
     */
    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['order.customer', 'invoice', 'receipts', 'receivedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Payment retrieved successfully',
            'data'    => new PaymentResource($payment),
        ]);
    }

    /**
     * Void a payment. Only accessible to users with the Owner role.
     */
    public function void(VoidPaymentRequest $request, Payment $payment): JsonResponse
    {
        if (!$request->user()->hasRole('Owner')) {
            return response()->json([
                'success' => false,
                'message' => 'Only Owners can void payments',
                'data'    => null,
            ], 403);
        }

        if ($payment->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Payment is already voided/cancelled',
                'data'    => null,
            ], 422);
        }

        $payment->update([
            'status'              => 'cancelled',
            'voided_at'           => now(),
            'void_reason'         => $request->validated()['void_reason'],
            'voided_by_user_id'   => $request->user()->id,
        ]);

        $order = $payment->order;
        if ($order) {
            $this->billingService->recalculateOrderPaymentSummary($order);
        }

        if ($payment->invoice_id) {
            $this->billingService->recalculateInvoicePaymentStatus($payment->invoice);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment voided successfully',
            'data'    => new PaymentResource($payment->fresh()),
        ]);
    }

    /**
     * Refund a payment (partial or full).
     */
    public function refund(RefundPaymentRequest $request, Payment $payment): JsonResponse
    {
        $validated = $request->validated();

        if ((float) $validated['refund_amount'] > (float) $payment->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Refund amount cannot exceed the original payment amount',
                'data'    => null,
            ], 422);
        }

        if ($payment->status === 'refunded') {
            return response()->json([
                'success' => false,
                'message' => 'Payment has already been refunded',
                'data'    => null,
            ], 422);
        }

        $payment->update([
            'refund_amount' => $validated['refund_amount'],
            'refund_reason' => $validated['refund_reason'],
            'refund_date'   => $validated['refund_date'],
            'status'        => 'refunded',
        ]);

        $order = $payment->order;
        if ($order) {
            $this->billingService->recalculateOrderPaymentSummary($order);
        }

        if ($payment->invoice_id) {
            $this->billingService->recalculateInvoicePaymentStatus($payment->invoice);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment refunded successfully',
            'data'    => new PaymentResource($payment->fresh()),
        ]);
    }

    /**
     * Get the payment summary for an order along with the payment list.
     */
    public function orderSummary(Order $order): JsonResponse
    {
        $summary  = $order->paymentSummary;
        $payments = $order->payments()
            ->with(['invoice', 'receipts', 'receivedBy'])
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Order payment summary retrieved successfully',
            'data'    => [
                'summary'  => [
                    'total_order_amount'    => (float) ($summary?->total_order_amount ?? 0),
                    'total_invoiced_amount' => (float) ($summary?->total_invoiced_amount ?? 0),
                    'total_paid_amount'     => (float) ($summary?->total_paid_amount ?? 0),
                    'pending_amount'        => (float) ($summary?->pending_amount ?? $order->total_amount ?? 0),
                    'advance_amount'        => (float) ($summary?->advance_amount ?? 0),
                    'payment_status'        => $summary?->payment_status ?? 'unpaid',
                    'last_payment_date'     => $summary?->last_payment_date?->format('Y-m-d'),
                    'total_invoices'        => $summary?->total_invoices ?? 0,
                    'total_payments'        => $summary?->total_payments ?? 0,
                ],
                'payments' => PaymentResource::collection($payments),
            ],
        ]);
    }

    /**
     * Upload a receipt file for a payment.
     */
    public function uploadReceipt(Request $request, Payment $payment): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $file     = $request->file('file');
        $path     = $file->store("receipts/payments/{$payment->id}", 'public');
        $tenantId = app('tenant_id');

        $receipt = PaymentReceipt::create([
            'tenant_id'           => $tenantId,
            'payment_id'          => $payment->id,
            'file_name'           => $file->getClientOriginalName(),
            'file_path'           => $path,
            'file_size'           => $file->getSize(),
            'mime_type'           => $file->getMimeType(),
            'uploaded_by_user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Receipt uploaded successfully',
            'data'    => new PaymentReceiptResource($receipt),
        ], 201);
    }

    /**
     * Delete a specific receipt from a payment.
     */
    public function deleteReceipt(Payment $payment, PaymentReceipt $receipt): JsonResponse
    {
        if ($receipt->payment_id !== $payment->id) {
            return response()->json([
                'success' => false,
                'message' => 'Receipt does not belong to this payment',
                'data'    => null,
            ], 404);
        }

        Storage::disk('public')->delete($receipt->file_path);
        $receipt->delete();

        return response()->json([
            'success' => true,
            'message' => 'Receipt deleted successfully',
            'data'    => null,
        ]);
    }

    /**
     * Generate the next payment number.
     */
    private function generatePaymentNumber(): string
    {
        $tenantId = app('tenant_id');

        $sequence = OrderNumberSequence::where('tenant_id', $tenantId)
            ->where('sequence_type', 'payment')
            ->first();

        if ($sequence) {
            return $sequence->getNextNumber();
        }

        // Fallback: use DB max id
        $lastId = Payment::withTrashed()->where('tenant_id', $tenantId)->max('id') ?? 0;

        return 'PAY-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
    }
}
