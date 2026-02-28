<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * List users (team members)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query()
            ->where('tenant_id', app('tenant_id'))
            ->with(['roles']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->role($request->role);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $query->orderBy('name', 'asc');

        return UserResource::collection(
            $query->paginate($request->get('per_page', 15))
        );
    }

    /**
     * Create user (team member)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile' => 'nullable|string|max:15',
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:manager,staff',
        ]);

        // Check subscription limits
        $tenant = $request->user()->tenant;
        $currentUserCount = User::where('tenant_id', $tenant->id)->count();
        $plan = $tenant->subscription?->plan;

        $maxUsers = $plan?->limits['max_users'] ?? 1;

        if ($maxUsers !== -1 && $currentUserCount >= $maxUsers) {
            return response()->json([
                'message' => 'User limit reached. Please upgrade your plan.',
                'current_count' => $currentUserCount,
                'max_allowed' => $maxUsers,
            ], 422);
        }

        $user = User::create([
            'tenant_id' => app('tenant_id'),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'mobile' => $validated['mobile'] ?? null,
            'password' => Hash::make($validated['password'] ?? Str::random(16)),
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        return response()->json([
            'message' => 'User created successfully',
            'data' => new UserResource($user->load('roles')),
        ], 201);
    }

    /**
     * Get user details
     */
    public function show(User $user): UserResource
    {
        // Ensure user belongs to same tenant
        if ($user->tenant_id !== app('tenant_id')) {
            abort(404);
        }

        $user->load(['roles', 'permissions']);

        return new UserResource($user);
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        // Ensure user belongs to same tenant
        if ($user->tenant_id !== app('tenant_id')) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'mobile' => 'nullable|string|max:15',
            'password' => 'nullable|string|min:8',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => new UserResource($user->fresh()->load('roles')),
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(User $user): JsonResponse
    {
        // Ensure user belongs to same tenant
        if ($user->tenant_id !== app('tenant_id')) {
            abort(404);
        }

        // Cannot delete owner
        if ($user->hasRole('owner')) {
            return response()->json([
                'message' => 'Cannot delete owner account',
            ], 422);
        }

        // Cannot delete yourself
        if ($user->id === request()->user()->id) {
            return response()->json([
                'message' => 'Cannot delete your own account',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Update user status
     */
    public function updateStatus(Request $request, User $user): JsonResponse
    {
        // Ensure user belongs to same tenant
        if ($user->tenant_id !== app('tenant_id')) {
            abort(404);
        }

        // Cannot deactivate owner
        if ($user->hasRole('owner')) {
            return response()->json([
                'message' => 'Cannot deactivate owner account',
            ], 422);
        }

        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user->update(['is_active' => $validated['is_active']]);

        // Revoke tokens if deactivated
        if (!$validated['is_active']) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'User status updated successfully',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Update user role
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        // Ensure user belongs to same tenant
        if ($user->tenant_id !== app('tenant_id')) {
            abort(404);
        }

        // Cannot change owner role
        if ($user->hasRole('owner')) {
            return response()->json([
                'message' => 'Cannot change owner role',
            ], 422);
        }

        $validated = $request->validate([
            'role' => 'required|in:manager,staff',
        ]);

        $user->syncRoles([$validated['role']]);

        return response()->json([
            'message' => 'User role updated successfully',
            'data' => new UserResource($user->fresh()->load('roles')),
        ]);
    }
}
