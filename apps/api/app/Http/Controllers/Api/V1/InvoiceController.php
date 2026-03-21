<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelInvoiceRequest;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\InvoiceNumberSequence;
use App\Models\Order;
use App\Services\BillingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceController extends Controller
{
    public function __construct(private readonly BillingService $billingService)
    {
    }

    /**
     * KPI cards: total invoiced, collected, pending, cancelled for a given month/year or all-time.
     */
    public function kpis(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');
        $consolidated = $request->boolean('consolidated');
        $month = $request->integer('month', now()->month);
        $year  = $request->integer('year', now()->year);

        $invoiceQuery = DB::table('invoices')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at');

        if (!$consolidated) {
            $invoiceQuery->whereMonth('invoice_date', $month)->whereYear('invoice_date', $year);
        }

        $totalInvoiced  = (clone $invoiceQuery)->whereIn('status', ['issued', 'paid'])->sum('grand_total');
        $totalCollected = (clone $invoiceQuery)->whereIn('status', ['issued', 'paid'])->sum('amount_paid');
        $totalPending   = (clone $invoiceQuery)->whereIn('status', ['issued'])->sum('amount_pending');
        $totalCancelled = (clone $invoiceQuery)->where('status', 'cancelled')->sum('grand_total');

        return response()->json([
            'success' => true,
            'data' => [
                'total_invoiced'  => (float) $totalInvoiced,
                'total_collected' => (float) $totalCollected,
                'total_pending'   => (float) $totalPending,
                'total_cancelled' => (float) $totalCancelled,
            ],
        ]);
    }

    /**
     * List invoices with filters. Paginated.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Invoice::query()
            ->with(['customer', 'order']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('billing_name', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($q) => $q->where('display_name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('invoice_type')) {
            $query->where('invoice_type', $request->invoice_type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('invoice_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('invoice_date', '<=', $request->to_date);
        }

        $query->orderBy('invoice_date', 'desc');

        return InvoiceResource::collection(
            $query->paginate($request->integer('per_page', 15))
        );
    }

    /**
     * Create a new invoice with auto-calculated GST breakdown.
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $order    = Order::with(['customer', 'tenant.settings'])->findOrFail($validated['order_id']);
            $tenantId = app('tenant_id');

            $isInterState = $this->billingService->isInterState($order->customer, $tenantId);

            $calculated = $this->billingService->calculateInvoiceItems(
                $validated['items'],
                $validated['invoice_type'],
                $isInterState,
                $tenantId
            );

            $totals      = $calculated['totals'];
            $grandTotal  = $totals['grand_total_before_roundoff'];
            $roundOff    = round($grandTotal) - $grandTotal;
            $finalTotal  = round($grandTotal);

            $invoiceNumber = $this->generateInvoiceNumber($validated['invoice_type']);

            $tenantSettings = $order->tenant->settings;

            $invoice = Invoice::create([
                'tenant_id'         => $tenantId,
                'order_id'          => $order->id,
                'customer_id'       => $order->customer_id,
                'invoice_number'    => $invoiceNumber,
                'invoice_type'      => $validated['invoice_type'],
                'invoice_date'      => $validated['invoice_date'],
                'due_date'          => $validated['due_date'] ?? null,
                'status'            => 'draft',

                // Billing snapshot from customer
                'billing_name'      => $order->customer->name,
                'billing_address'   => $order->customer->address,
                'billing_city'      => $order->customer->city,
                'billing_state'     => $order->customer->state,
                'billing_pincode'   => $order->customer->pincode,
                'billing_gstin'     => $order->customer->gst_number,

                // Seller snapshot from tenant
                'seller_name'       => $tenantSettings?->gst_registered_name ?? $order->tenant->business_name,
                'seller_gstin'      => $tenantSettings?->gst_number,
                'seller_pan_number' => $tenantSettings?->pan_number,
                'place_of_supply'   => $order->customer->state,
                'is_inter_state'    => $isInterState,

                // Amounts
                'subtotal'          => $totals['subtotal'],
                'discount_amount'   => $totals['total_discount'],
                'taxable_amount'    => $totals['total_taxable'],
                'cgst_amount'       => $totals['total_cgst'],
                'sgst_amount'       => $totals['total_sgst'],
                'igst_amount'       => $totals['total_igst'],
                'total_tax_amount'  => $totals['total_tax'],
                'total_amount'      => $grandTotal,
                'round_off_amount'  => $roundOff,
                'grand_total'       => $finalTotal,
                'amount_in_words'   => $this->billingService->amountToWords($finalTotal),
                'amount_pending'    => $finalTotal,

                'notes'             => $validated['notes'] ?? null,
                'terms_conditions'  => $validated['terms_conditions'] ?? null,
                'created_by_user_id' => $request->user()->id,
            ]);

            foreach ($calculated['items'] as $itemData) {
                $invoice->items()->create($itemData);
            }

            $this->billingService->recalculateOrderPaymentSummary($order);

            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'data'    => new InvoiceResource($invoice->load(['customer', 'order', 'items'])),
            ], 201);
        });
    }

    /**
     * Show a single invoice with all relationships.
     */
    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['customer', 'order', 'items', 'payments', 'createdBy']);

        return response()->json([
            'success' => true,
            'message' => 'Invoice retrieved successfully',
            'data'    => new InvoiceResource($invoice),
        ]);
    }

    /**
     * Update a draft invoice (recalculates all amounts).
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft invoices can be updated',
                'data'    => null,
            ], 422);
        }

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $invoice) {
            $order    = $invoice->order()->with(['customer', 'tenant.settings'])->first();
            $tenantId = app('tenant_id');

            if (isset($validated['items'])) {
                $invoiceType  = $validated['invoice_type'] ?? $invoice->invoice_type;
                $isInterState = $this->billingService->isInterState($order->customer, $tenantId);

                $calculated  = $this->billingService->calculateInvoiceItems(
                    $validated['items'],
                    $invoiceType,
                    $isInterState,
                    $tenantId
                );

                $totals     = $calculated['totals'];
                $grandTotal = $totals['grand_total_before_roundoff'];
                $roundOff   = round($grandTotal) - $grandTotal;
                $finalTotal = round($grandTotal);

                $tenantSettings = $order->tenant->settings;

                $invoice->update([
                    'invoice_type'      => $invoiceType,
                    'invoice_date'      => $validated['invoice_date'] ?? $invoice->invoice_date,
                    'due_date'          => $validated['due_date'] ?? $invoice->due_date,
                    'notes'             => $validated['notes'] ?? $invoice->notes,
                    'terms_conditions'  => $validated['terms_conditions'] ?? $invoice->terms_conditions,
                    'is_inter_state'    => $isInterState,
                    'subtotal'          => $totals['subtotal'],
                    'discount_amount'   => $totals['total_discount'],
                    'taxable_amount'    => $totals['total_taxable'],
                    'cgst_amount'       => $totals['total_cgst'],
                    'sgst_amount'       => $totals['total_sgst'],
                    'igst_amount'       => $totals['total_igst'],
                    'total_tax_amount'  => $totals['total_tax'],
                    'total_amount'      => $grandTotal,
                    'round_off_amount'  => $roundOff,
                    'grand_total'       => $finalTotal,
                    'amount_in_words'   => $this->billingService->amountToWords($finalTotal),
                    'amount_pending'    => $finalTotal - ($invoice->amount_paid ?? 0),
                ]);

                // Replace invoice items
                $invoice->items()->delete();
                foreach ($calculated['items'] as $itemData) {
                    $invoice->items()->create($itemData);
                }
            } else {
                // Non-items update (notes, dates, etc.)
                $invoice->update(array_filter([
                    'invoice_date'     => $validated['invoice_date'] ?? null,
                    'due_date'         => $validated['due_date'] ?? null,
                    'notes'            => $validated['notes'] ?? null,
                    'terms_conditions' => $validated['terms_conditions'] ?? null,
                ], fn($v) => $v !== null));
            }

            return response()->json([
                'success' => true,
                'message' => 'Invoice updated successfully',
                'data'    => new InvoiceResource($invoice->fresh(['customer', 'order', 'items'])),
            ]);
        });
    }

    /**
     * Update invoice status (draft → issued → cancelled).
     */
    public function updateStatus(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,issued,cancelled',
        ]);

        $updates = ['status' => $validated['status']];

        if ($validated['status'] === 'issued' && $invoice->issued_at === null) {
            $updates['issued_at'] = now();
        }

        $invoice->update($updates);

        return response()->json([
            'success' => true,
            'message' => 'Invoice status updated successfully',
            'data'    => new InvoiceResource($invoice->fresh()),
        ]);
    }

    /**
     * Cancel an invoice (blocked when payment_status = paid).
     */
    public function cancel(CancelInvoiceRequest $request, Invoice $invoice): JsonResponse
    {
        if ($invoice->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel a fully paid invoice',
                'data'    => null,
            ], 422);
        }

        $invoice->update([
            'status'               => 'cancelled',
            'cancellation_reason'  => $request->validated()['cancellation_reason'],
            'cancelled_at'         => now(),
        ]);

        $order = $invoice->order;
        if ($order) {
            $this->billingService->recalculateOrderPaymentSummary($order);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice cancelled successfully',
            'data'    => new InvoiceResource($invoice->fresh()),
        ]);
    }

    /**
     * Mark invoice as sent and set sent_at timestamp.
     * TODO: Wire up actual WhatsApp / email delivery via notification service.
     */
    public function send(Invoice $invoice): JsonResponse
    {
        $updates = ['sent_at' => now()];

        // Auto-issue if still in draft
        if ($invoice->status === 'draft') {
            $updates['status']    = 'issued';
            $updates['issued_at'] = $invoice->issued_at ?? now();
        }

        $invoice->update($updates);

        // TODO: Dispatch WhatsApp/email notification job here
        // e.g. SendInvoiceNotification::dispatch($invoice);

        return response()->json([
            'success' => true,
            'message' => 'Invoice sent successfully',
            'data'    => new InvoiceResource($invoice->fresh()),
        ]);
    }

    /**
     * Soft-delete a draft invoice.
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        if ($invoice->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft invoices can be deleted',
                'data'    => null,
            ], 422);
        }

        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invoice deleted successfully',
            'data'    => null,
        ]);
    }

    /**
     * Download invoice as PDF.
     */
    public function downloadPdf(Invoice $invoice)
    {
        $invoice->load(['customer', 'order', 'items', 'tenant.settings']);

        $pdf = Pdf::loadView('invoices.pdf', ['invoice' => $invoice]);

        return $pdf->download("Invoice-{$invoice->invoice_number}.pdf");
    }

    /**
     * Generate the next invoice number using the sequence table.
     */
    private function generateInvoiceNumber(string $invoiceType): string
    {
        $tenantId = app('tenant_id');
        $sequence = InvoiceNumberSequence::getForTenant($tenantId, $invoiceType);

        return $sequence->getNextNumber();
    }
}
