<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Mail\VerifyTenantEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Services\TenantService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class TenantRegistrationController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Check if a subdomain is available.
     */
    public function checkSubdomain(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subdomain' => 'required|string|alpha_dash|min:3|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['available' => false, 'message' => 'Invalid subdomain format.'], 422);
        }

        $exists = Tenant::where('subdomain', $request->subdomain)->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Subdomain is already taken.' : 'Subdomain is available.'
        ]);
    }

    /**
     * Register a new tenant.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_name' => 'required|string|max:255',
            'subdomain' => 'required|string|alpha_dash|unique:tenants,subdomain|max:50',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|unique:tenants,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            return DB::transaction(function () use ($request) {
                // 1. Create Tenant
                $tenant = Tenant::create([
                    'uuid' => (string) Str::uuid(),
                    'business_name' => $request->business_name,
                    'display_name' => $request->business_name,
                    'subdomain' => $request->subdomain,
                    'email' => $request->email,
                    'mobile' => $request->mobile ?? '0000000000',
                    'status' => 'trial',
                    'onboarding_completed' => false,
                    'onboarding_step' => 1,
                    'verification_token' => Str::random(60),
                ]);

                // 2. Create Owner User
                $user = User::create([
                    'tenant_id' => $tenant->id,
                    'name' => $request->owner_name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'is_active' => false,
                    'is_super_admin' => false,
                ]);

                if (method_exists($user, 'assignRole')) {
                    $user->assignRole('owner');
                }

                // 3. Send Verification Email
                $landingUrl = env('LANDING_SITE_URL', 'http://localhost:5173');
                $verificationUrl = "{$landingUrl}/verify?token={$tenant->verification_token}&email=" . urlencode($tenant->email);
                
                Mail::to($user->email)->send(new VerifyTenantEmail($tenant, $user, $verificationUrl));

                return response()->json([
                    'message' => 'Tenant registered successfully. Please check your email for verification.',
                    'tenant' => [
                        'id' => $tenant->id,
                        'business_name' => $tenant->business_name,
                        'subdomain' => $tenant->subdomain,
                    ]
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Registration failed.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Verify tenant email.
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenant = Tenant::where('email', $request->email)->first();

        if (!$tenant) {
            return response()->json(['message' => 'Invalid verification link.'], 404);
        }

        // Handle React Strict Mode double-calls in development
        if ($tenant->email_verified_at) {
            return response()->json([
                'message' => 'Email verified successfully!',
                'subdomain' => $tenant->subdomain,
            ], 200);
        }

        if ($tenant->verification_token !== $request->token) {
            return response()->json(['message' => 'Verification link is invalid or has expired.'], 404);
        }

        try {
            DB::transaction(function () use ($tenant) {
                // Activate Tenant
                $tenant->update([
                    'email_verified_at' => Carbon::now(),
                    'verification_token' => null,
                    'status' => 'active',
                ]);

                // Activate Owner User
                User::where('tenant_id', $tenant->id)
                    ->where('email', $tenant->email)
                    ->update(['is_active' => true, 'email_verified_at' => Carbon::now()]);

                // Create Trial Subscription (Starter Plan)
                $this->tenantService->initializeNewTenant($tenant);
            });

            return response()->json([
                'message' => 'Email verified successfully! You can now log in and set up your workspace.',
                'subdomain' => $tenant->subdomain,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Verification failed.', 'error' => $e->getMessage()], 500);
        }
    }
}
