<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenantContext
{
    /**
     * Handle an incoming request.
     * Sets the tenant context from the authenticated user.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->tenant_id) {
            // Store tenant_id in app container for global access
            app()->instance('tenant_id', $user->tenant_id);

            // Also store the full tenant if needed
            app()->instance('tenant', $user->tenant);
        }

        return $next($request);
    }
}
