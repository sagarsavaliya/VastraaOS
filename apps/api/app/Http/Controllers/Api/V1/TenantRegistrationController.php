<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Services\OtpService;
use App\Services\TenantService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TenantRegistrationController extends Controller
{
    protected TenantService $tenantService;
    protected OtpService $otpService;

    public function __construct(TenantService $tenantService, OtpService $otpService)
    {
        $this->tenantService = $tenantService;
        $this->otpService    = $otpService;
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
            'message'   => $exists ? 'Subdomain is already taken.' : 'Subdomain is available.',
        ]);
    }

    /**
     * Register a new tenant. Sends OTP to email + SMS instead of a token link.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_name' => 'required|string|max:255',
            'subdomain'     => 'required|string|alpha_dash|unique:tenants,subdomain|max:50',
            'owner_name'    => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email|unique:tenants,email',
            'mobile'        => 'nullable|string|max:15',
            'password'      => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            return DB::transaction(function () use ($request) {
                // 1. Create Tenant
                $tenant = Tenant::create([
                    'uuid'                => (string) Str::uuid(),
                    'business_name'       => $request->business_name,
                    'display_name'        => $request->business_name,
                    'subdomain'           => $request->subdomain,
                    'email'               => $request->email,
                    'mobile'              => $request->mobile ?? '0000000000',
                    'status'              => 'trial',
                    'onboarding_completed' => false,
                    'onboarding_step'     => 1,
                ]);

                // 2. Create Owner User (inactive until OTP verified)
                $user = User::create([
                    'tenant_id'      => $tenant->id,
                    'name'           => $request->owner_name,
                    'email'          => $request->email,
                    'mobile'         => $request->mobile,
                    'password'       => Hash::make($request->password),
                    'is_active'      => false,
                    'is_super_admin' => false,
                ]);

                if (method_exists($user, 'assignRole')) {
                    $user->assignRole('owner');
                }

                // 3. Generate OTP and dispatch to email + SMS
                $otpRecord = $this->otpService->generate($tenant->id, $user->id, 'registration');
                $this->otpService->sendEmail($otpRecord, $user, $tenant);
                $this->otpService->sendSms($otpRecord, $user->mobile ?? $tenant->mobile);

                return response()->json([
                    'message' => 'Registration successful. A 6-digit verification code has been sent to your email and mobile.',
                    'tenant'  => [
                        'id'            => $tenant->id,
                        'business_name' => $tenant->business_name,
                        'subdomain'     => $tenant->subdomain,
                    ],
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Registration failed.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Verify the registration OTP and activate the tenant.
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenant = Tenant::where('email', $request->email)->first();

        if (!$tenant) {
            return response()->json(['message' => 'No account found with this email address.'], 404);
        }

        // Idempotent — already verified (handles React Strict Mode double-calls)
        if ($tenant->email_verified_at) {
            return response()->json([
                'message'   => 'Account already verified. You can now log in.',
                'subdomain' => $tenant->subdomain,
            ]);
        }

        $result = $this->otpService->verify($tenant->id, 'registration', $request->otp);

        if ($result === 'not_found') {
            return response()->json([
                'message'    => 'No active verification code found. Please request a new one.',
                'can_resend' => true,
            ], 422);
        }

        if ($result === 'expired') {
            return response()->json([
                'message'    => 'Your verification code has expired. Please request a new one.',
                'can_resend' => true,
            ], 422);
        }

        if ($result === 'invalid') {
            return response()->json([
                'message' => 'Invalid verification code. Please check and try again.',
            ], 422);
        }

        try {
            DB::transaction(function () use ($tenant) {
                $tenant->update([
                    'email_verified_at' => Carbon::now(),
                    'status'            => 'active',
                ]);

                User::where('tenant_id', $tenant->id)
                    ->where('email', $tenant->email)
                    ->update(['is_active' => true, 'email_verified_at' => Carbon::now()]);

                $this->tenantService->initializeNewTenant($tenant);
            });

            return response()->json([
                'message'   => 'Account verified successfully! You can now log in and set up your workspace.',
                'subdomain' => $tenant->subdomain,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Verification failed.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Resend the registration OTP (max 3 times).
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenant = Tenant::where('email', $request->email)->first();

        if (!$tenant) {
            return response()->json(['message' => 'No account found with this email address.'], 404);
        }

        if ($tenant->email_verified_at) {
            return response()->json(['message' => 'Account is already verified.'], 422);
        }

        $user = User::where('tenant_id', $tenant->id)->where('email', $tenant->email)->first();

        $otpRecord = $this->otpService->resend($tenant->id, $user?->id, 'registration');

        if ($otpRecord === false) {
            return response()->json([
                'message' => 'Maximum resend limit reached. Please contact support.',
            ], 429);
        }

        if ($user) {
            $this->otpService->sendEmail($otpRecord, $user, $tenant);
            $this->otpService->sendSms($otpRecord, $user->mobile ?? $tenant->mobile);
        }

        return response()->json([
            'message' => 'A new verification code has been sent to your email and mobile.',
        ]);
    }

    /**
     * Legacy token-link verify endpoint — no longer supported.
     */
    public function verify(Request $request)
    {
        return response()->json([
            'message' => 'This verification method is no longer supported. Please use the OTP verification flow.',
        ], 410);
    }
}
