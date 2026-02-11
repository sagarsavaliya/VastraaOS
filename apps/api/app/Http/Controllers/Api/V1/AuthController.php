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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new tenant with owner
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            // Create tenant
            $tenant = Tenant::create([
                'uuid' => Str::uuid(),
                'business_name' => $validated['business_name'],
                'display_name' => $validated['display_name'] ?? $validated['business_name'],
                'subdomain' => $validated['subdomain'],
                'email' => $validated['email'],
                'mobile' => $validated['mobile'] ?? null,
                'status' => 'trial',
                'onboarding_completed' => false,
                'onboarding_step' => 1,
            ]);

            // Create default tenant settings
            TenantSetting::create([
                'tenant_id' => $tenant->id,
                'currency' => 'INR',
                'timezone' => 'Asia/Kolkata',
                'measurement_unit' => 'inches',
            ]);

            // Create trial subscription (Free plan)
            $freePlan = DB::table('subscription_plans')->where('slug', 'free')->first();
            if ($freePlan) {
                TenantSubscription::create([
                    'tenant_id' => $tenant->id,
                    'plan_id' => $freePlan->id,
                    'status' => 'trialing',
                    'billing_cycle' => 'monthly',
                    'current_period_start' => now(),
                    'current_period_end' => now()->addDays(14),
                    'trial_ends_at' => now()->addDays(14),
                ]);
            }

            // Create owner user
            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'mobile' => $validated['mobile'] ?? null,
                'is_active' => true,
            ]);

            // Assign owner role
            $user->assignRole('owner');

            // Seed default master data for tenant
            $this->seedTenantMasterData($tenant->id);

            // Create token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful',
                'user' => new UserResource($user->load('tenant', 'roles')),
                'token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        });
    }

    /**
     * Login user
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

        // Check tenant status
        if ($user->tenant && !in_array($user->tenant->status, ['active', 'trial'])) {
            throw ValidationException::withMessages([
                'email' => ['Your organization account is not active.'],
            ]);
        }

        // Revoke existing tokens if requested
        if ($request->boolean('revoke_existing')) {
            $user->tokens()->delete();
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user->load('tenant', 'roles')),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        // Revoke all tokens
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out from all devices successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenant', 'tenant.settings', 'tenant.subscription.plan', 'roles', 'permissions');

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Update profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'mobile' => 'nullable|string|max:15',
            'avatar' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => new UserResource($user->fresh()->load('tenant', 'roles')),
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Revoke all other tokens
        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Seed default master data for a new tenant
     */
    private function seedTenantMasterData(int $tenantId): void
    {
        // Use the MasterDataSeeder static methods
        $masterData = [
            'item_types' => \Database\Seeders\MasterDataSeeder::getDefaultItemTypes(),
            'work_types' => \Database\Seeders\MasterDataSeeder::getDefaultWorkTypes(),
            'embellishment_zones' => \Database\Seeders\MasterDataSeeder::getDefaultEmbellishmentZones(),
            'inquiry_sources' => \Database\Seeders\MasterDataSeeder::getDefaultInquirySources(),
            'occasions' => \Database\Seeders\MasterDataSeeder::getDefaultOccasions(),
            'budget_ranges' => \Database\Seeders\MasterDataSeeder::getDefaultBudgetRanges(),
            'measurement_types' => \Database\Seeders\MasterDataSeeder::getDefaultMeasurementTypes(),
            'order_statuses' => \Database\Seeders\MasterDataSeeder::getDefaultOrderStatuses(),
            'order_priorities' => \Database\Seeders\MasterDataSeeder::getDefaultOrderPriorities(),
        ];

        foreach ($masterData as $table => $items) {
            foreach ($items as $item) {
                $data = array_merge($item, [
                    'tenant_id' => $tenantId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Add currency for budget_ranges
                if ($table === 'budget_ranges') {
                    $data['currency'] = 'INR';
                }

                DB::table($table)->insert($data);
            }
        }

        // Seed workflow stages
        foreach (\Database\Seeders\WorkflowStageSeeder::getDefaultStages() as $stage) {
            DB::table('workflow_stages')->insert(array_merge($stage, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed number sequences
        $sequences = [
            ['sequence_type' => 'order', 'prefix' => 'ORD-'],
            ['sequence_type' => 'invoice_gst', 'prefix' => 'GST-'],
            ['sequence_type' => 'invoice_non_gst', 'prefix' => 'INV-'],
            ['sequence_type' => 'inquiry', 'prefix' => 'INQ-'],
            ['sequence_type' => 'customer', 'prefix' => 'CUST-'],
            ['sequence_type' => 'worker', 'prefix' => 'WRK-'],
            ['sequence_type' => 'payment', 'prefix' => 'PAY-'],
        ];

        $fiscalYear = $this->getCurrentFiscalYear();

        foreach ($sequences as $seq) {
            DB::table('order_number_sequences')->insert([
                'tenant_id' => $tenantId,
                'sequence_type' => $seq['sequence_type'],
                'prefix' => $seq['prefix'],
                'current_number' => 0,
                'padding_length' => 4,
                'fiscal_year' => $fiscalYear,
                'reset_yearly' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function getCurrentFiscalYear(): string
    {
        $month = (int) date('n');
        $year = (int) date('Y');

        if ($month < 4) {
            return ($year - 1) . '-' . substr($year, 2);
        }

        return $year . '-' . substr($year + 1, 2);
    }
}
