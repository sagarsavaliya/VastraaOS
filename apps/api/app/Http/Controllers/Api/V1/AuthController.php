<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Tenant;
use App\Models\TenantSetting;
use App\Models\TenantSubscription;
use App\Models\User;
use App\Services\OtpService;
use App\Services\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected TenantService $tenantService;
    protected OtpService $otpService;

    public function __construct(TenantService $tenantService, OtpService $otpService)
    {
        $this->tenantService = $tenantService;
        $this->otpService    = $otpService;
    }

    /**
     * Register a new tenant with owner (legacy — kept for reference)
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $tenant = Tenant::create([
                'uuid'          => Str::uuid(),
                'business_name' => $validated['business_name'],
                'display_name'  => $validated['display_name'] ?? $validated['business_name'],
                'subdomain'     => $validated['subdomain'],
                'email'         => $validated['email'],
                'mobile'        => $validated['mobile'] ?? null,
                'status'        => 'trial',
                'onboarding_completed' => false,
                'onboarding_step'      => 1,
            ]);

            $user = User::create([
                'tenant_id' => $tenant->id,
                'name'      => $validated['name'],
                'email'     => $validated['email'],
                'password'  => Hash::make($validated['password']),
                'is_active' => false,
            ]);

            $user->assignRole('owner');
            $this->tenantService->initializeNewTenant($tenant);

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message'    => 'Registration successful',
                'user'       => new UserResource($user->load('tenant', 'roles')),
                'token'      => $token,
                'token_type' => 'Bearer',
            ], 201);
        });
    }

    /**
     * Login user. If tenant has 2FA enabled, returns requires_otp instead of a token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated.'],
            ]);
        }

        if ($user->tenant && !in_array($user->tenant->status, ['active', 'trial'])) {
            throw ValidationException::withMessages([
                'email' => ['Your organization account is not active.'],
            ]);
        }

        // 2FA check — applies to tenant users only (not super admins)
        if (!$user->isSuperAdmin() && $user->tenant) {
            $settings = $user->tenant->settings;
            if ($settings && $settings->two_factor_enabled) {
                $otpRecord = $this->otpService->generate($user->tenant->id, $user->id, 'login');
                $this->otpService->sendEmail($otpRecord, $user, $user->tenant);
                $this->otpService->sendSms($otpRecord, $user->mobile ?? $user->tenant->mobile);

                return response()->json([
                    'requires_otp' => true,
                    'message'      => 'A verification code has been sent to your registered email and mobile.',
                ]);
            }
        }

        if ($request->boolean('revoke_existing')) {
            $user->tokens()->delete();
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);

        return response()->json([
            'message'    => 'Login successful',
            'user'       => new UserResource($user->load('tenant', 'roles')),
            'token'      => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Verify login OTP and issue auth token.
     */
    public function verifyLoginOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Account not found or inactive.'],
            ]);
        }

        if ($user->tenant && !in_array($user->tenant->status, ['active', 'trial'])) {
            throw ValidationException::withMessages([
                'email' => ['Your organization account is not active.'],
            ]);
        }

        $result = $this->otpService->verify($user->tenant->id, 'login', $validated['otp']);

        if ($result === 'not_found') {
            return response()->json(['message' => 'No active OTP found. Please log in again to request a new code.'], 422);
        }
        if ($result === 'expired') {
            return response()->json(['message' => 'Your OTP has expired. Please log in again to request a new code.'], 422);
        }
        if ($result === 'invalid') {
            return response()->json(['message' => 'Invalid verification code. Please check and try again.'], 422);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);

        return response()->json([
            'message'    => 'Login successful',
            'user'       => new UserResource($user->load('tenant', 'roles')),
            'token'      => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Resend login OTP (max 3 times).
     */
    public function resendLoginOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !$user->is_active || !$user->tenant) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        $otpRecord = $this->otpService->resend($user->tenant->id, $user->id, 'login');

        if ($otpRecord === false) {
            return response()->json([
                'message' => 'Maximum resend limit reached. Please log in again to start a new session.',
            ], 429);
        }

        $this->otpService->sendEmail($otpRecord, $user, $user->tenant);
        $this->otpService->sendSms($otpRecord, $user->mobile ?? $user->tenant->mobile);

        return response()->json([
            'message' => 'A new verification code has been sent to your email and mobile.',
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out from all devices successfully']);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenant', 'tenant.settings', 'tenant.subscription.plan', 'roles', 'permissions');
        return response()->json(['user' => new UserResource($user)]);
    }

    /**
     * Update profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'mobile' => 'nullable|string|max:15',
            'avatar' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => new UserResource($user->fresh()->load('tenant', 'roles')),
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password changed successfully']);
    }
}
