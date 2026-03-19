<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\HsnCode;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderPaymentSummary;
use App\Models\TenantSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    /**
     * Calculate invoice line items with full GST breakdown.
     *
     * Resolves GST rate in priority order:
     *  1. Tenant-specific HSN code override
     *  2. System-default HSN code (tenant_id IS NULL)
     *  3. Tenant default_gst_rate from settings
     *  4. Hard fallback: 12%
     *
     * @param  array   $items       Raw items from the request (validated)
     * @param  string  $invoiceType 'gst' | 'non_gst'
     * @param  bool    $isInterState
     * @param  int     $tenantId
     * @return array   ['items' => [...enriched items], 'totals' => [...]]
     */
    public function calculateInvoiceItems(
        array $items,
        string $invoiceType,
        bool $isInterState,
        int $tenantId
    ): array {
        $tenantSettings = TenantSetting::where('tenant_id', $tenantId)->first();
        $defaultGstRate = $tenantSettings?->hidden_gst_percentage ?? 12;

        $subtotal                 = 0.0;
        $totalDiscount            = 0.0;
        $totalTaxable             = 0.0;
        $totalCgst                = 0.0;
        $totalSgst                = 0.0;
        $totalIgst                = 0.0;

        $enrichedItems = [];

        foreach ($items as $index => $itemData) {
            $quantity        = (float) $itemData['quantity'];
            $unitPrice       = (float) $itemData['unit_price'];
            $discountAmount  = (float) ($itemData['discount_amount'] ?? 0);
            $grossLine       = $quantity * $unitPrice;
            $taxableAmount   = $grossLine - $discountAmount;

            // Resolve GST rate
            $gstRate = $this->resolveGstRate(
                $itemData['hsn_code'] ?? null,
                $itemData['gst_rate'] ?? null,
                $tenantId,
                $defaultGstRate
            );

            $cgstRate   = 0.0;
            $sgstRate   = 0.0;
            $igstRate   = 0.0;
            $cgstAmount = 0.0;
            $sgstAmount = 0.0;
            $igstAmount = 0.0;

            if ($invoiceType === 'gst') {
                if ($isInterState) {
                    $igstRate   = $gstRate;
                    $igstAmount = round($taxableAmount * $igstRate / 100, 2);
                } else {
                    $cgstRate   = $gstRate / 2;
                    $sgstRate   = $gstRate / 2;
                    $cgstAmount = round($taxableAmount * $cgstRate / 100, 2);
                    $sgstAmount = round($taxableAmount * $sgstRate / 100, 2);
                }
            }

            $lineTotal = $taxableAmount + $cgstAmount + $sgstAmount + $igstAmount;

            $subtotal       += $grossLine;
            $totalDiscount  += $discountAmount;
            $totalTaxable   += $taxableAmount;
            $totalCgst      += $cgstAmount;
            $totalSgst      += $sgstAmount;
            $totalIgst      += $igstAmount;

            $enrichedItems[] = [
                'order_item_id'  => $itemData['order_item_id'] ?? null,
                'description'    => $itemData['description'],
                'hsn_code'       => $itemData['hsn_code'] ?? null,
                'quantity'       => $quantity,
                'unit'           => $itemData['unit'] ?? 'pcs',
                'unit_price'     => $unitPrice,
                'discount_amount' => $discountAmount,
                'taxable_amount' => $taxableAmount,
                'cgst_rate'      => $cgstRate,
                'cgst_amount'    => $cgstAmount,
                'sgst_rate'      => $sgstRate,
                'sgst_amount'    => $sgstAmount,
                'igst_rate'      => $igstRate,
                'igst_amount'    => $igstAmount,
                'total_amount'   => $lineTotal,
                'display_order'  => $index + 1,
            ];
        }

        $totalTax               = $totalCgst + $totalSgst + $totalIgst;
        $grandTotalBeforeRoundoff = $totalTaxable + $totalTax;

        return [
            'items'  => $enrichedItems,
            'totals' => [
                'subtotal'                    => round($subtotal, 2),
                'total_discount'              => round($totalDiscount, 2),
                'total_taxable'               => round($totalTaxable, 2),
                'total_cgst'                  => round($totalCgst, 2),
                'total_sgst'                  => round($totalSgst, 2),
                'total_igst'                  => round($totalIgst, 2),
                'total_tax'                   => round($totalTax, 2),
                'grand_total_before_roundoff' => round($grandTotalBeforeRoundoff, 2),
            ],
        ];
    }

    /**
     * Resolve the applicable GST rate for a line item.
     */
    private function resolveGstRate(
        ?string $hsnCode,
        mixed $requestedRate,
        int $tenantId,
        float $defaultGstRate
    ): float {
        // If a rate was explicitly provided on the line item, trust it
        if ($requestedRate !== null) {
            return (float) $requestedRate;
        }

        if ($hsnCode) {
            // 1. Tenant-specific override
            $tenantHsn = HsnCode::where('tenant_id', $tenantId)
                ->where('hsn_code', $hsnCode)
                ->where('is_active', true)
                ->first();

            if ($tenantHsn) {
                return (float) $tenantHsn->gst_rate;
            }

            // 2. System default
            $systemHsn = HsnCode::whereNull('tenant_id')
                ->where('hsn_code', $hsnCode)
                ->where('is_active', true)
                ->first();

            if ($systemHsn) {
                return (float) $systemHsn->gst_rate;
            }
        }

        // 3. Tenant-level default
        return $defaultGstRate;
    }

    /**
     * Recalculate and persist the OrderPaymentSummary for an order.
     *
     * Uses DB aggregation rather than loading Eloquent collections.
     */
    public function recalculateOrderPaymentSummary(Order $order): OrderPaymentSummary
    {
        // Sum issued invoices (status = issued; payment_status tracks paid/partial/overdue)
        $totalInvoiced = (float) Invoice::where('order_id', $order->id)
            ->where('status', 'issued')
            ->sum('grand_total');

        // Effective paid = sum of completed amounts minus refunds
        $totalPaid = (float) DB::table('payments')
            ->where('order_id', $order->id)
            ->whereNotIn('status', ['cancelled', 'failed'])
            ->whereNull('deleted_at')
            ->selectRaw('SUM(amount - COALESCE(refund_amount, 0)) as total')
            ->value('total') ?? 0.0;

        // Advance payments
        $advanceAmount = (float) DB::table('payments')
            ->where('order_id', $order->id)
            ->where('advance_payment', true)
            ->whereNotIn('status', ['cancelled', 'failed'])
            ->whereNull('deleted_at')
            ->sum('amount');

        $pendingAmount = max(0, $totalInvoiced - $totalPaid);

        // Determine payment_status
        if ($pendingAmount <= 0 && $totalPaid > 0) {
            $paymentStatus = 'paid';
        } elseif ($totalPaid > 0) {
            $paymentStatus = 'partial';
        } else {
            $paymentStatus = 'unpaid';
        }

        $totalInvoicesCount = Invoice::where('order_id', $order->id)
            ->where('status', 'issued')
            ->count();

        $totalPaymentsCount = DB::table('payments')
            ->where('order_id', $order->id)
            ->where('status', 'completed')
            ->whereNull('deleted_at')
            ->count();

        $lastPaymentDate = DB::table('payments')
            ->where('order_id', $order->id)
            ->where('status', 'completed')
            ->whereNull('deleted_at')
            ->max('payment_date');

        $summary = OrderPaymentSummary::updateOrCreate(
            ['order_id' => $order->id],
            [
                'total_order_amount'   => (float) ($order->total_amount ?? 0),
                'total_invoiced_amount' => $totalInvoiced,
                'total_paid_amount'    => $totalPaid,
                'pending_amount'       => $pendingAmount,
                'advance_amount'       => $advanceAmount,
                'total_invoices'       => $totalInvoicesCount,
                'total_payments'       => $totalPaymentsCount,
                'last_payment_date'    => $lastPaymentDate,
                'payment_status'       => $paymentStatus,
                'last_updated_at'      => now(),
            ]
        );

        return $summary;
    }

    /**
     * Recalculate and update the payment_status (and paid_at) on an Invoice.
     */
    public function recalculateInvoicePaymentStatus(Invoice $invoice): void
    {
        // Sum effective payments (completed or partial — not cancelled/voided)
        $effectivePaid = (float) DB::table('payments')
            ->where('invoice_id', $invoice->id)
            ->whereNotIn('status', ['cancelled', 'failed'])
            ->whereNull('voided_at')
            ->whereNull('deleted_at')
            ->selectRaw('SUM(amount - COALESCE(refund_amount, 0)) as total')
            ->value('total') ?? 0.0;

        $grandTotal = (float) ($invoice->grand_total ?: $invoice->total_amount);

        $updates = [];

        $pendingAmount = max(0, $grandTotal - $effectivePaid);

        $updates['amount_paid']    = $effectivePaid;
        $updates['amount_pending'] = $pendingAmount;

        if ($effectivePaid >= $grandTotal && $grandTotal > 0) {
            $updates['payment_status'] = 'paid';
            $updates['paid_at']        = $invoice->paid_at ?? now();
        } elseif ($effectivePaid > 0) {
            $updates['payment_status'] = 'partial';
        } else {
            if (
                $invoice->due_date &&
                $invoice->due_date->isPast() &&
                $invoice->status === 'issued'
            ) {
                $updates['payment_status'] = 'overdue';
            } else {
                $updates['payment_status'] = 'unpaid';
            }
        }

        if (!empty($updates)) {
            $invoice->update($updates);
        }
    }

    /**
     * Determine whether an order's billing is inter-state (IGST) or same-state (CGST+SGST).
     *
     * Compares the customer's state with the tenant's registered state via tenants.state_code.
     * Falls back to false (same-state) when state codes are unavailable.
     */
    public function isInterState(Customer $customer, int $tenantId): bool
    {
        // Customer state — the Customer model stores state as a plain state name; use city/state fields
        $customerState = $customer->state ?? null;

        // Tenant's registered state from the tenants table directly
        $tenantStateCode = DB::table('tenants')
            ->where('id', $tenantId)
            ->value('state_code');

        if (!$customerState || !$tenantStateCode) {
            return false;
        }

        // Normalise to upper-case for comparison
        return strtoupper(trim($customerState)) !== strtoupper(trim($tenantStateCode));
    }

    /**
     * Convert a rupee amount to Indian words.
     *
     * Examples:
     *   4300.50  → "Four Thousand Three Hundred Rupees and Fifty Paise Only"
     *   100000   → "One Lakh Rupees Only"
     */
    public function amountToWords(float $amount): string
    {
        $amount   = round($amount, 2);
        $rupees   = (int) floor($amount);
        $paise    = (int) round(($amount - $rupees) * 100);

        if ($rupees === 0 && $paise === 0) {
            return 'Zero Rupees Only';
        }

        $words = '';

        if ($rupees > 0) {
            $words .= $this->integerToIndianWords($rupees) . ' Rupees';
        }

        if ($paise > 0) {
            $paiseWords = $this->twoDigitWords($paise);
            if ($rupees > 0) {
                $words .= ' and ' . $paiseWords . ' Paise';
            } else {
                $words .= $paiseWords . ' Paise';
            }
        }

        return $words . ' Only';
    }

    /**
     * Convert integer (rupees portion) to Indian number-word system.
     */
    private function integerToIndianWords(int $number): string
    {
        if ($number === 0) {
            return '';
        }

        $crore    = (int) floor($number / 10_000_000);
        $number  %= 10_000_000;

        $lakh     = (int) floor($number / 100_000);
        $number  %= 100_000;

        $thousand = (int) floor($number / 1_000);
        $number  %= 1_000;

        $hundred  = (int) floor($number / 100);
        $number  %= 100;

        $words = '';

        if ($crore > 0) {
            $words .= $this->twoDigitWords($crore) . ' Crore ';
        }

        if ($lakh > 0) {
            $words .= $this->twoDigitWords($lakh) . ' Lakh ';
        }

        if ($thousand > 0) {
            $words .= $this->twoDigitWords($thousand) . ' Thousand ';
        }

        if ($hundred > 0) {
            $ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            $words .= $ones[$hundred] . ' Hundred ';
        }

        if ($number > 0) {
            $words .= $this->twoDigitWords($number);
        }

        return trim($words);
    }

    /**
     * Convert a number 1-99 to English words.
     */
    private function twoDigitWords(int $num): string
    {
        $ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
            'Eighteen', 'Nineteen',
        ];
        $tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if ($num < 20) {
            return $ones[$num];
        }

        $ten  = (int) floor($num / 10);
        $unit = $num % 10;

        return $tens[$ten] . ($unit > 0 ? ' ' . $ones[$unit] : '');
    }
}
