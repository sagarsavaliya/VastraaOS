<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
    /**
     * List all tenants with status and basic KPIs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tenant::with(['subscription.plan', 'settings'])
            ->withCount(['users', 'orders', 'customers']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('subdomain', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tenants = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $tenants->items(),
            'meta' => [
                'current_page' => $tenants->currentPage(),
                'last_page' => $tenants->lastPage(),
                'per_page' => $tenants->perPage(),
                'total' => $tenants->total(),
            ]
        ]);
    }

    /**
     * Show comprehensive tenant profile.
     */
    public function show(Tenant $tenant): JsonResponse
    {
        $tenant->load(['subscription.plan', 'settings']);
        
        // Calculate detailed KPIs
        $kpis = [
            'users' => [
                'current' => $tenant->users()->count(),
                'limit' => $tenant->subscription?->plan?->limits['max_users'] ?? -1,
            ],
            'orders' => [
                'total' => $tenant->orders()->count(),
                'this_month' => $tenant->orders()->whereMonth('created_at', now()->month)->count(),
                'limit' => $tenant->subscription?->plan?->limits['max_orders_per_month'] ?? -1,
            ],
            'customers' => [
                'total' => $tenant->customers()->count(),
                'limit' => $tenant->subscription?->plan?->limits['max_customers'] ?? -1,
            ],
            'workers' => [
                'total' => $tenant->workers()->count(),
                'limit' => $tenant->subscription?->plan?->limits['max_workers'] ?? -1,
            ]
        ];

        return response()->json([
            'tenant' => $tenant,
            'kpis' => $kpis,
        ]);
    }

    /**
     * Update tenant metadata or toggle modules.
     */
    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,suspended,trial,expired',
            'modules' => 'sometimes|array',
        ]);

        if (isset($validated['modules'])) {
            $settings = $tenant->settings;
            if ($settings) {
                // Assuming modules map to boolean flags in settings
                $settings->update($validated['modules']);
            }
        }

        $tenant->update(array_intersect_key($validated, array_flip(['business_name', 'status'])));

        return response()->json([
            'message' => 'Tenant updated successfully',
            'tenant' => $tenant->fresh(['settings']),
        ]);
    }

    /**
     * Update tenant status.
     */
    public function updateStatus(Request $request, Tenant $tenant): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:active,suspended,trial,expired',
        ]);

        $tenant->update(['status' => $validated['status']]);

        return response()->json([
            'message' => "Tenant status updated to {$validated['status']}",
            'tenant' => $tenant,
        ]);
    }

    /**
     * Get platform-wide global stats.
     */
    public function globalStats(): JsonResponse
    {
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('status', 'active')->count();
        $trialTenants = Tenant::where('status', 'trial')->count();
        
        $totalUsers = DB::table('users')->whereNotNull('tenant_id')->count();
        $totalOrders = DB::table('orders')->count();

        return response()->json([
            'tenants' => [
                'total' => $totalTenants,
                'active' => $activeTenants,
                'trial' => $trialTenants,
            ],
            'usage' => [
                'total_users' => $totalUsers,
                'total_orders' => $totalOrders,
            ]
        ]);
    }
}
