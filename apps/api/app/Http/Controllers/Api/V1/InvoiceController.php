<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceNumberSequence;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * List invoices
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Invoice::query()
            ->with(['customer', 'order']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter by type
        if ($request->has('invoice_type')) {
            $query->where('invoice_type', $request->invoice_type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('invoice_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('invoice_date', '<=', $request->to_date);
        }

        // Sorting
        $query->orderBy('invoice_date', 'desc');

        return InvoiceResource::collection(
            $query->paginate($request->get('per_page', 15))
        );
    }

    /**
     * Create invoice
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'invoice_type' => 'required|in:gst,non_gst',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.order_item_id' => 'nullable|exists:order_items,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.hsn_code' => 'nullable|string|max:8',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string|max:20',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $order = Order::findOrFail($validated['order_id']);
            $tenantId = app('tenant_id');

            // Get tenant settings for GST
            $tenantSettings = $order->tenant->settings;

            // Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber($validated['invoice_type']);

            // Determine if it's inter-state (IGST) or intra-state (CGST+SGST)
            $isInterState = $order->customer->state_code !== $tenantSettings->state_code;

            // Calculate totals
            $subtotal = 0;
            $totalDiscount = 0;
            $totalCgst = 0;
            $totalSgst = 0;
            $totalIgst = 0;

            $invoiceItems = [];

            foreach ($validated['items'] as $index => $itemData) {
                $quantity = $itemData['quantity'];
                $unitPrice = $itemData['unit_price'];
                $discount = $itemData['discount_amount'] ?? 0;

                $lineTotal = ($quantity * $unitPrice) - $discount;
                $subtotal += $quantity * $unitPrice;
                $totalDiscount += $discount;

                // Get GST rate from HSN code or default
                $gstRate = 12; // Default GST rate

                $cgstRate = 0;
                $sgstRate = 0;
                $igstRate = 0;
                $cgstAmount = 0;
                $sgstAmount = 0;
                $igstAmount = 0;

                if ($validated['invoice_type'] === 'gst') {
                    if ($isInterState) {
                        $igstRate = $gstRate;
                        $igstAmount = $lineTotal * ($igstRate / 100);
                        $totalIgst += $igstAmount;
                    } else {
                        $cgstRate = $gstRate / 2;
                        $sgstRate = $gstRate / 2;
                        $cgstAmount = $lineTotal * ($cgstRate / 100);
                        $sgstAmount = $lineTotal * ($sgstRate / 100);
                        $totalCgst += $cgstAmount;
                        $totalSgst += $sgstAmount;
                    }
                }

                $invoiceItems[] = [
                    'order_item_id' => $itemData['order_item_id'] ?? null,
                    'description' => $itemData['description'],
                    'hsn_code' => $itemData['hsn_code'] ?? null,
                    'quantity' => $quantity,
                    'unit' => $itemData['unit'] ?? 'pcs',
                    'unit_price' => $unitPrice,
                    'discount_amount' => $discount,
                    'taxable_amount' => $lineTotal,
                    'cgst_rate' => $cgstRate,
                    'cgst_amount' => $cgstAmount,
                    'sgst_rate' => $sgstRate,
                    'sgst_amount' => $sgstAmount,
                    'igst_rate' => $igstRate,
                    'igst_amount' => $igstAmount,
                    'total_amount' => $lineTotal + $cgstAmount + $sgstAmount + $igstAmount,
                    'display_order' => $index + 1,
                ];
            }

            $taxableAmount = $subtotal - $totalDiscount;
            $taxAmount = $totalCgst + $totalSgst + $totalIgst;
            $totalAmount = $taxableAmount + $taxAmount;

            // Create invoice
            $invoice = Invoice::create([
                'tenant_id' => $tenantId,
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'invoice_number' => $invoiceNumber,
                'invoice_type' => $validated['invoice_type'],
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'status' => 'draft',

                // Billing info from customer
                'billing_name' => $order->customer->name,
                'billing_address' => $order->customer->address,
                'billing_city' => $order->customer->city,
                'billing_state' => $order->customer->state,
                'billing_pincode' => $order->customer->pincode,
                'billing_gstin' => null, // Customer GSTIN if B2B

                // Seller info from tenant settings
                'seller_gstin' => $tenantSettings->gst_number,
                'seller_name' => $tenantSettings->gst_registered_name ?? $order->tenant->business_name,
                'place_of_supply' => $order->customer->state,
                'is_inter_state' => $isInterState,

                // Amounts
                'subtotal' => $subtotal,
                'discount_amount' => $totalDiscount,
                'taxable_amount' => $taxableAmount,
                'cgst_amount' => $totalCgst,
                'sgst_amount' => $totalSgst,
                'igst_amount' => $totalIgst,
                'total_tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'amount_in_words' => $this->convertToWords($totalAmount),

                'notes' => $validated['notes'] ?? null,
                'created_by_user_id' => $request->user()->id,
            ]);

            // Create invoice items
            foreach ($invoiceItems as $itemData) {
                $invoice->items()->create($itemData);
            }

            return response()->json([
                'message' => 'Invoice created successfully',
                'data' => new InvoiceResource($invoice->load(['customer', 'order', 'items'])),
            ], 201);
        });
    }

    /**
     * Get invoice details
     */
    public function show(Invoice $invoice): InvoiceResource
    {
        $invoice->load(['customer', 'order', 'items', 'payments', 'createdBy']);

        return new InvoiceResource($invoice);
    }

    /**
     * Delete invoice (only draft)
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        if ($invoice->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft invoices can be deleted',
            ], 422);
        }

        $invoice->delete();

        return response()->json([
            'message' => 'Invoice deleted successfully',
        ]);
    }

    /**
     * Update invoice status
     */
    public function updateStatus(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,paid,cancelled',
        ]);

        $invoice->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Invoice status updated successfully',
            'data' => new InvoiceResource($invoice->fresh()),
        ]);
    }

    /**
     * Download invoice PDF
     */
    public function downloadPdf(Invoice $invoice)
    {
        $invoice->load(['customer', 'order', 'items', 'tenant.settings']);

        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice,
        ]);

        return $pdf->download("Invoice-{$invoice->invoice_number}.pdf");
    }

    /**
     * Send invoice to customer
     */
    public function send(Request $request, Invoice $invoice): JsonResponse
    {
        // TODO: Implement email/WhatsApp sending
        $invoice->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => 'Invoice sent successfully',
        ]);
    }

    /**
     * Generate invoice number
     */
    private function generateInvoiceNumber(string $invoiceType): string
    {
        $tenantId = app('tenant_id');

        $sequence = InvoiceNumberSequence::getForTenant($tenantId, $invoiceType);

        return $sequence->getNextNumber();
    }

    /**
     * Convert amount to words (Indian format)
     */
    private function convertToWords(float $amount): string
    {
        $ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        $tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        $amount = round($amount);

        if ($amount == 0) {
            return 'Zero Rupees Only';
        }

        $crore = floor($amount / 10000000);
        $amount %= 10000000;

        $lakh = floor($amount / 100000);
        $amount %= 100000;

        $thousand = floor($amount / 1000);
        $amount %= 1000;

        $hundred = floor($amount / 100);
        $amount %= 100;

        $words = '';

        if ($crore > 0) {
            $words .= $this->twoDigitToWords($crore, $ones, $tens) . ' Crore ';
        }

        if ($lakh > 0) {
            $words .= $this->twoDigitToWords($lakh, $ones, $tens) . ' Lakh ';
        }

        if ($thousand > 0) {
            $words .= $this->twoDigitToWords($thousand, $ones, $tens) . ' Thousand ';
        }

        if ($hundred > 0) {
            $words .= $ones[$hundred] . ' Hundred ';
        }

        if ($amount > 0) {
            $words .= $this->twoDigitToWords($amount, $ones, $tens);
        }

        return trim($words) . ' Rupees Only';
    }

    private function twoDigitToWords(int $num, array $ones, array $tens): string
    {
        if ($num < 20) {
            return $ones[$num];
        }

        return $tens[floor($num / 10)] . ($num % 10 ? ' ' . $ones[$num % 10] : '');
    }
}
