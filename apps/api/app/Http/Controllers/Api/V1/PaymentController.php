<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderNumberSequence;
use App\Models\OrderPaymentSummary;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * List payments
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()
            ->with(['order.customer', 'invoice', 'receivedBy']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%")
                    ->orWhereHas('order.customer', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter by order
        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        // Filter by payment mode
        if ($request->has('payment_mode')) {
            $query->where('payment_mode', $request->payment_mode);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        // Sorting
        $query->orderBy('payment_date', 'desc');

        $payments = $query->paginate($request->get('per_page', 15));

        return response()->json($payments);
    }

    /**
     * Record a new payment
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_mode' => 'required|in:cash,upi,card,bank_transfer,cheque,other',
            'payment_date' => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'cheque_number' => 'nullable|string|max:50',
            'cheque_date' => 'nullable|date',
            'bank_name' => 'nullable|string|max:100',
            'transaction_id' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $order = Order::findOrFail($validated['order_id']);
            $paymentSummary = $order->paymentSummary;

            // Check if payment exceeds pending amount
            if ($validated['amount'] > $paymentSummary->pending_amount) {
                return response()->json([
                    'message' => 'Payment amount exceeds pending amount',
                    'pending_amount' => $paymentSummary->pending_amount,
                ], 422);
            }

            // Generate payment number
            $paymentNumber = $this->generatePaymentNumber();

            // Create payment
            $payment = Payment::create([
                'tenant_id' => app('tenant_id'),
                'order_id' => $order->id,
                'invoice_id' => $validated['invoice_id'] ?? null,
                'payment_number' => $paymentNumber,
                'amount' => $validated['amount'],
                'payment_mode' => $validated['payment_mode'],
                'payment_date' => $validated['payment_date'],
                'reference_number' => $validated['reference_number'] ?? null,
                'cheque_number' => $validated['cheque_number'] ?? null,
                'cheque_date' => $validated['cheque_date'] ?? null,
                'bank_name' => $validated['bank_name'] ?? null,
                'transaction_id' => $validated['transaction_id'] ?? null,
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
                'received_by_user_id' => $request->user()->id,
            ]);

            // Update payment summary
            $newPaidAmount = $paymentSummary->total_paid_amount + $validated['amount'];
            $newPendingAmount = $paymentSummary->total_order_amount - $newPaidAmount;
            $paymentStatus = $newPendingAmount <= 0 ? 'paid' : 'partial';

            $paymentSummary->update([
                'total_paid_amount' => $newPaidAmount,
                'pending_amount' => max(0, $newPendingAmount),
                'last_payment_date' => $validated['payment_date'],
            ]);

            // Update order payment status and amounts (denormalized)
            $order->update([
                'amount_paid' => $newPaidAmount,
                'amount_pending' => max(0, $newPendingAmount),
                'payment_status' => $paymentStatus,
            ]);

            // If linked to invoice, update invoice status
            if ($payment->invoice_id) {
                $invoice = $payment->invoice;
                $invoicePayments = $invoice->payments()->where('status', 'completed')->sum('amount');

                if ($invoicePayments >= $invoice->total_amount) {
                    $invoice->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);
                }
            }

            return response()->json([
                'message' => 'Payment recorded successfully',
                'data' => $payment->load(['order', 'receivedBy']),
                'summary' => $paymentSummary->fresh(),
            ], 201);
        });
    }

    /**
     * Get payment details
     */
    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['order.customer', 'invoice', 'receivedBy']);

        return response()->json([
            'data' => $payment,
        ]);
    }

    /**
     * Get order payment summary
     */
    public function orderSummary(Order $order): JsonResponse
    {
        $summary = $order->paymentSummary;
        $payments = $order->payments()
            ->with(['receivedBy', 'invoice'])
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json([
            'summary' => [
                'total_amount' => (float) $summary->total_order_amount,
                'paid_amount' => (float) $summary->total_paid_amount,
                'pending_amount' => (float) $summary->pending_amount,
                'payment_status' => $order->payment_status,
                'last_payment_date' => $summary->last_payment_date?->format('Y-m-d'),
            ],
            'payments' => $payments,
        ]);
    }

    /**
     * Generate payment number
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

        // Fallback
        $lastPayment = Payment::latest('id')->first();
        $nextNumber = $lastPayment ? $lastPayment->id + 1 : 1;

        return 'PAY-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
