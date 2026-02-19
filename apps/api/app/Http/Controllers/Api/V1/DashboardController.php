<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(Request $request): JsonResponse
    {
        if (!app()->bound('tenant_id')) {
            return response()->json([
                'orders' => ['total' => 0, 'active' => 0, 'pending_payment' => 0],
                'revenue' => ['this_month' => 0, 'invoiced_this_month' => 0, 'avg_order_value' => 0, 'total_pending_amount' => 0],
                'customers' => ['total' => 0, 'new_this_month' => 0],
                'inquiries' => ['total' => 0, 'converted' => 0, 'conversion_rate' => 0],
                'tasks' => ['pending' => 0, 'overdue' => 0],
                'deliveries' => ['upcoming_7_days' => 0, 'overdue' => 0],
            ]);
        }

        $tenantId = app('tenant_id');

        // Get final status IDs
        $finalStatusIds = DB::table('order_statuses')
            ->where('tenant_id', $tenantId)
            ->where('is_final', true)
            ->pluck('id')
            ->toArray();

        // Orders stats
        $totalOrders = Order::count();
        $activeOrders = Order::whereNotIn('status_id', $finalStatusIds)->count();
        $pendingPaymentOrders = Order::whereHas('paymentSummary', fn($q) => $q->where('payment_status', '!=', 'paid'))->count();

        // Revenue stats (this month)
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        $monthlyRevenue = Payment::whereBetween('payment_date', [$monthStart, $monthEnd])
            ->where('status', 'completed')
            ->sum('amount');

        $monthlyInvoiced = Invoice::whereBetween('invoice_date', [$monthStart, $monthEnd])
            ->whereIn('status', ['sent', 'paid'])
            ->sum('total_amount');

        // Customer stats
        $totalCustomers = Customer::count();
        $newCustomersThisMonth = Customer::whereBetween('created_at', [$monthStart, $monthEnd])->count();

        // Inquiry stats
        $totalInquiries = DB::table('customer_inquiries')->where('tenant_id', $tenantId)->count();
        $convertedInquiries = DB::table('customer_inquiries')
            ->where('tenant_id', $tenantId)
            ->where('status', 'converted')
            ->count();
        $conversionRate = $totalInquiries > 0 ? ($convertedInquiries / $totalInquiries) * 100 : 0;

        // Pending amount (Ughrani)
        $totalPendingAmount = Order::sum('amount_pending');
        $avgOrderValue = Order::count() > 0 ? Order::sum('total_amount') / Order::count() : 0;

        // Pending tasks
        $pendingTasks = DB::table('order_workflow_tasks')
            ->join('orders', 'order_workflow_tasks.order_id', '=', 'orders.id')
            ->where('orders.tenant_id', $tenantId)
            ->where('order_workflow_tasks.status', 'pending')
            ->count();

        $overdueTasks = DB::table('order_workflow_tasks')
            ->join('orders', 'order_workflow_tasks.order_id', '=', 'orders.id')
            ->where('orders.tenant_id', $tenantId)
            ->where('order_workflow_tasks.due_date', '<', now())
            ->whereNotIn('order_workflow_tasks.status', ['completed', 'skipped'])
            ->count();

        // Upcoming deliveries (next 7 days)
        $upcomingDeliveries = Order::whereBetween('promised_delivery_date', [now(), now()->addDays((int) 7)])
            ->whereNotIn('status_id', $finalStatusIds)
            ->count();

        // Overdue deliveries
        $overdueDeliveries = Order::where('promised_delivery_date', '<', now())
            ->whereNotIn('status_id', $finalStatusIds)
            ->count();

        return response()->json([
            'orders' => [
                'total' => $totalOrders,
                'active' => $activeOrders,
                'pending_payment' => $pendingPaymentOrders,
            ],
            'revenue' => [
                'this_month' => (float) $monthlyRevenue,
                'invoiced_this_month' => (float) $monthlyInvoiced,
                'avg_order_value' => (float) $avgOrderValue,
                'total_pending_amount' => (float) $totalPendingAmount,
            ],
            'customers' => [
                'total' => $totalCustomers,
                'new_this_month' => $newCustomersThisMonth,
            ],
            'inquiries' => [
                'total' => $totalInquiries,
                'converted' => $convertedInquiries,
                'conversion_rate' => round($conversionRate, 2),
            ],
            'tasks' => [
                'pending' => $pendingTasks,
                'overdue' => $overdueTasks,
            ],
            'deliveries' => [
                'upcoming_7_days' => $upcomingDeliveries,
                'overdue' => $overdueDeliveries,
            ],
        ]);
    }

    /**
     * Get recent orders
     */
    public function recentOrders(Request $request): JsonResponse
    {
        if (!app()->bound('tenant_id')) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => (int) $request->get('limit', 5),
                    'total' => 0,
                ]
            ]);
        }

        $limit = (int) $request->get('limit', 5);
        $search = $request->get('search');
        
        $query = Order::with(['customer', 'status', 'priority']);

        if ($search) {
            $query->search($search);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');

        $orders = $query->orderBy($sortBy, $sortDir)
            ->paginate($limit);

        return response()->json([
            'data' => collect($orders->items())->map(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer->name,
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status->name,
                'status_color' => $order->status->color,
                'priority' => $order->priority->name,
                'priority_color' => $order->priority->color,
                'promised_delivery_date' => $order->promised_delivery_date?->format('Y-m-d'),
                'created_at' => $order->created_at->toISOString(),
            ]),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    /**
     * Get upcoming deliveries
     */
    public function upcomingDeliveries(Request $request): JsonResponse
    {
        if (!app()->bound('tenant_id')) {
            return response()->json(['data' => []]);
        }

        $days = (int) $request->get('days', 7);
        $limit = (int) $request->get('limit', 20);
        $tenantId = app('tenant_id');

        // Get final status IDs
        $finalStatusIds = DB::table('order_statuses')
            ->where('tenant_id', $tenantId)
            ->where('is_final', true)
            ->pluck('id')
            ->toArray();

        $orders = Order::with(['customer', 'status', 'priority'])
            ->whereBetween('promised_delivery_date', [now(), now()->addDays($days)])
            ->whereNotIn('status_id', $finalStatusIds)
            ->orderBy('promised_delivery_date')
            ->limit($limit)
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer->name,
                'customer_mobile' => $order->customer->mobile,
                'promised_delivery_date' => $order->promised_delivery_date->format('Y-m-d'),
                'days_remaining' => $order->promised_delivery_date->diffInDays(now()),
                'status' => $order->status->name,
                'priority' => $order->priority->name,
                'priority_color' => $order->priority->color,
            ]);

        return response()->json([
            'data' => $orders,
        ]);
    }
}
