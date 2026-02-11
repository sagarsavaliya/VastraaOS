<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantStatus
{
    /**
     * Handle an incoming request.
     * Checks if the tenant is active and subscription is valid.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Super admins bypass tenant checks
        if ($user->is_super_admin) {
            return $next($request);
        }

        $tenant = $user->tenant;

        if (!$tenant) {
            return response()->json([
                'message' => 'No organization associated with this account.',
            ], 403);
        }

        // Check tenant status
        if (!in_array($tenant->status, ['active', 'trial'])) {
            return response()->json([
                'message' => 'Your organization account is suspended or inactive.',
                'status' => $tenant->status,
            ], 403);
        }

        // Check subscription
        $subscription = $tenant->subscription;

        if (!$subscription) {
            return response()->json([
                'message' => 'No active subscription found.',
            ], 403);
        }

        // Check if subscription is expired
        if ($subscription->status === 'expired' ||
            ($subscription->current_period_end && $subscription->current_period_end->isPast())) {
            return response()->json([
                'message' => 'Your subscription has expired. Please renew to continue.',
                'subscription_status' => 'expired',
            ], 403);
        }

        // Check if trial has ended
        if ($subscription->status === 'trialing' &&
            $subscription->trial_ends_at &&
            $subscription->trial_ends_at->isPast()) {
            return response()->json([
                'message' => 'Your trial period has ended. Please subscribe to continue.',
                'subscription_status' => 'trial_ended',
            ], 403);
        }

        return $next($request);
    }
}
