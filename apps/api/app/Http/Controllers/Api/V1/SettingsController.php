<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Http\Resources\TenantSettingResource;
use App\Http\Resources\TenantSubscriptionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get tenant settings
     */
    public function getTenantSettings(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;
        $tenant->load(['settings']);

        return response()->json([
            'tenant' => new TenantResource($tenant),
            'settings' => new TenantSettingResource($tenant->settings),
        ]);
    }

    /**
     * Update tenant settings
     */
    public function updateTenantSettings(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only owner can update settings
        if (!$user->hasRole('owner')) {
            return response()->json([
                'message' => 'Only owner can update settings',
            ], 403);
        }

        $tenant = $user->tenant;
        $settings = $tenant->settings;

        // Consolidate validation
        $validated = $request->validate([
            // Tenant fields
            'business_name' => 'sometimes|string|max:255',
            'display_name' => 'nullable|string|max:100',
            'email' => 'sometimes|email|max:100',
            'mobile' => 'nullable|string|max:15',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'state_code' => 'nullable|string|max:2',
            'pincode' => 'nullable|string|max:10',
            'logo_url' => 'nullable|string|max:255',

            // Settings fields
            'gst_module_enabled' => 'sometimes|boolean',
            'gst_number' => 'nullable|string|max:15',
            'gst_registered_name' => 'nullable|string|max:255',
            'pan_number' => 'nullable|string|max:10',
            'hidden_gst_percentage' => 'nullable|numeric|min:0|max:100',
            'gst_invoice_prefix' => 'nullable|string|max:20',
            'non_gst_invoice_prefix' => 'nullable|string|max:20',
            'order_prefix' => 'nullable|string|max:20',
            'financial_year_start' => 'nullable|integer|min:1|max:12',
            'currency' => 'nullable|string|max:3',
            'timezone' => 'nullable|string|max:50',
            'date_format' => 'nullable|string|max:20',
            'measurement_unit' => 'nullable|string|in:inches,cm',
            'terms_and_conditions' => 'nullable|string',
            'invoice_notes' => 'nullable|string',
        ]);

        // Separate validated data
        $tenantFields = ['business_name', 'display_name', 'email', 'mobile', 'address', 'city', 'state', 'state_code', 'pincode', 'logo_url'];
        $settingsFields = ['gst_module_enabled', 'gst_number', 'gst_registered_name', 'pan_number', 'hidden_gst_percentage', 'gst_invoice_prefix', 'non_gst_invoice_prefix', 'order_prefix', 'financial_year_start', 'currency', 'timezone', 'date_format', 'measurement_unit', 'terms_and_conditions', 'invoice_notes'];

        $tenantData = array_intersect_key($validated, array_flip($tenantFields));
        $settingsData = array_intersect_key($validated, array_flip($settingsFields));

        // Update tenant
        if (!empty($tenantData)) {
            $tenant->update($tenantData);
        }

        // Update settings
        if (!empty($settingsData)) {
            $settings = $tenant->settings()->updateOrCreate([], $settingsData);
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'tenant' => new TenantResource($tenant->fresh()),
            'settings' => $settings ? new TenantSettingResource($settings->fresh()) : null,
        ]);
    }

    /**
     * Update onboarding status
     */
    public function updateOnboardingStatus(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        $validated = $request->validate([
            'step' => 'required|integer',
            'is_completed' => 'boolean',
        ]);

        $updateData = [
            'onboarding_step' => $validated['step'],
        ];

        if ($validated['is_completed'] ?? ($validated['step'] >= 6)) {
            $updateData['onboarding_completed'] = true;
        }

        $tenant->update($updateData);

        return response()->json([
            'message' => 'Onboarding status updated successfully',
            'tenant' => new TenantResource($tenant->fresh()),
        ]);
    }


    /**
     * Get subscription details
     */
    public function getSubscription(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;
        $subscription = $tenant->subscription;

        if (!$subscription) {
            return response()->json([
                'subscription' => null,
                'plans' => $this->getAvailablePlans(),
            ]);
        }

        $subscription->load('plan');

        // Get usage stats
        $usage = [
            'users' => [
                'current' => $tenant->users()->count(),
                'limit' => $subscription->plan->limits['max_users'] ?? -1,
            ],
            'orders_this_month' => [
                'current' => $tenant->orders()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'limit' => $subscription->plan->limits['max_orders_per_month'] ?? -1,
            ],
        ];

        return response()->json([
            'subscription' => new TenantSubscriptionResource($subscription),
            'usage' => $usage,
            'plans' => $this->getAvailablePlans(),
        ]);
    }

    /**
     * Get available subscription plans
     */
    private function getAvailablePlans(): array
    {
        return \App\Models\SubscriptionPlan::where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->map(fn($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'price_monthly' => (float) $plan->price_monthly,
                'price_yearly' => (float) $plan->price_yearly,
                'features' => $plan->features,
                'limits' => $plan->limits,
                'is_featured' => $plan->is_featured,
            ])
            ->toArray();
    }
}
