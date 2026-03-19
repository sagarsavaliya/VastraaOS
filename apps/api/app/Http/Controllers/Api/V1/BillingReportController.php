<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillingReportController extends Controller
{
    /**
     * Aggregated billing summary for the current tenant (current month stats).
     */
    public function summary(): JsonResponse
    {
        $tenantId = app('tenant_id');
        $now      = now();

        // Current month invoiced
        $monthInvoiced = DB::table('invoices')
            ->where('tenant_id', $tenantId)
            ->whereMonth('invoice_date', $now->month)
            ->whereYear('invoice_date', $now->year)
            ->where('status', 'issued')
            ->whereNull('deleted_at')
            ->sum('grand_total');

        // Current month collected
        $monthCollected = DB::table('payments')
            ->where('tenant_id', $tenantId)
            ->whereMonth('payment_date', $now->month)
            ->whereYear('payment_date', $now->year)
            ->where('status', 'completed')
            ->whereNull('deleted_at')
            ->sum('amount');

        // Total outstanding (issued invoices not fully paid)
        $totalOutstanding = DB::table('invoices')
            ->where('tenant_id', $tenantId)
            ->where('status', 'issued')
            ->where('payment_status', '!=', 'paid')
            ->whereNull('deleted_at')
            ->sum('amount_pending');

        // Overdue invoices count and amount
        $overdueQuery = DB::table('invoices')
            ->where('tenant_id', $tenantId)
            ->where('status', 'issued')
            ->whereNotIn('payment_status', ['paid', 'cancelled'])
            ->where('due_date', '<', $now->toDateString())
            ->whereNull('deleted_at');

        $overdueCount  = (clone $overdueQuery)->count();
        $overdueAmount = (clone $overdueQuery)->sum('amount_pending');

        // Payment mode breakdown — all time
        $modeBreakdown = DB::table('payments')
            ->where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereNull('deleted_at')
            ->select('payment_mode', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('payment_mode')
            ->get();

        // All-time totals
        $allTimeInvoiced = DB::table('invoices')
            ->where('tenant_id', $tenantId)
            ->where('status', 'issued')
            ->whereNull('deleted_at')
            ->sum('grand_total');

        $allTimeCollected = DB::table('payments')
            ->where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereNull('deleted_at')
            ->sum('amount');

        return response()->json([
            'success' => true,
            'message' => 'Billing summary retrieved successfully',
            'data'    => [
                'current_month' => [
                    'invoiced'  => (float) $monthInvoiced,
                    'collected' => (float) $monthCollected,
                ],
                'all_time' => [
                    'invoiced'  => (float) $allTimeInvoiced,
                    'collected' => (float) $allTimeCollected,
                ],
                'outstanding' => [
                    'total_amount' => (float) $totalOutstanding,
                ],
                'overdue' => [
                    'count'  => $overdueCount,
                    'amount' => (float) $overdueAmount,
                ],
                'payment_mode_breakdown' => $modeBreakdown,
            ],
        ]);
    }

    /**
     * Paginated list of overdue invoices (due_date past, not paid, status=issued).
     */
    public function overdue(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');

        $invoices = Invoice::with(['customer', 'order'])
            ->where('tenant_id', $tenantId)
            ->where('status', 'issued')
            ->whereNotIn('payment_status', ['paid', 'cancelled'])
            ->where('due_date', '<', now()->toDateString())
            ->orderBy('due_date', 'asc')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Overdue invoices retrieved successfully',
            'data'    => InvoiceResource::collection($invoices)->response()->getData(true),
        ]);
    }

    /**
     * Accounts receivable ageing buckets (0-30, 31-60, 61-90, 90+ days).
     */
    public function receivables(): JsonResponse
    {
        $tenantId = app('tenant_id');

        $buckets = DB::table('invoices')
            ->where('tenant_id', $tenantId)
            ->where('status', 'issued')
            ->where('payment_status', '!=', 'paid')
            ->whereNull('deleted_at')
            ->selectRaw("
                SUM(CASE WHEN DATEDIFF(NOW(), invoice_date) BETWEEN 0 AND 30
                    THEN amount_pending ELSE 0 END) as bucket_0_30,
                SUM(CASE WHEN DATEDIFF(NOW(), invoice_date) BETWEEN 31 AND 60
                    THEN amount_pending ELSE 0 END) as bucket_31_60,
                SUM(CASE WHEN DATEDIFF(NOW(), invoice_date) BETWEEN 61 AND 90
                    THEN amount_pending ELSE 0 END) as bucket_61_90,
                SUM(CASE WHEN DATEDIFF(NOW(), invoice_date) > 90
                    THEN amount_pending ELSE 0 END) as bucket_90_plus,
                SUM(amount_pending) as total_receivables,
                COUNT(*) as invoice_count
            ")
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Receivables ageing retrieved successfully',
            'data'    => [
                '0_30_days'  => (float) ($buckets->bucket_0_30 ?? 0),
                '31_60_days' => (float) ($buckets->bucket_31_60 ?? 0),
                '61_90_days' => (float) ($buckets->bucket_61_90 ?? 0),
                '90_plus_days' => (float) ($buckets->bucket_90_plus ?? 0),
                'total_receivables' => (float) ($buckets->total_receivables ?? 0),
                'invoice_count' => (int) ($buckets->invoice_count ?? 0),
            ],
        ]);
    }

    /**
     * Payment collections report — daily totals + mode breakdown.
     * Accepts ?from_date=&to_date=&payment_mode= filters.
     */
    public function paymentsReport(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');

        $query = DB::table('payments')
            ->where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereNull('deleted_at');

        if ($request->filled('from_date')) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        if ($request->filled('payment_mode')) {
            $query->where('payment_mode', $request->payment_mode);
        }

        // Daily totals
        $dailyTotals = (clone $query)
            ->select('payment_date', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_date')
            ->orderBy('payment_date', 'desc')
            ->get();

        // Mode breakdown
        $modeBreakdown = (clone $query)
            ->select('payment_mode', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_mode')
            ->get();

        $grandTotal = (clone $query)->sum('amount');

        return response()->json([
            'success' => true,
            'message' => 'Payments report retrieved successfully',
            'data'    => [
                'grand_total'    => (float) $grandTotal,
                'daily_totals'   => $dailyTotals,
                'mode_breakdown' => $modeBreakdown,
            ],
        ]);
    }
}
