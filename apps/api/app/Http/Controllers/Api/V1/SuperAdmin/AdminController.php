<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * List all Super Admins.
     */
    public function index(): JsonResponse
    {
        $admins = User::where('is_super_admin', true)->latest()->get();
        return response()->json([
            'data' => UserResource::collection($admins)
        ]);
    }

    /**
     * Invite/Create a new Super Admin.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile' => 'nullable|string|max:15',
            'password' => 'required|string|min:8',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'mobile' => $validated['mobile'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_super_admin' => true,
            'is_active' => true,
            'tenant_id' => null, // Super Admins are global
        ]);

        return response()->json([
            'message' => 'Super Admin created successfully',
            'data' => new UserResource($admin)
        ], 201);
    }

    /**
     * Revoke Super Admin access.
     */
    public function destroy(User $user): JsonResponse
    {
        // Don't allow revoking if not a super admin
        if (!$user->is_super_admin) {
            return response()->json(['message' => 'User is not a super admin'], 422);
        }

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot revoke your own admin access'], 422);
        }

        // We don't delete the user, just revoke admin status or deactivate
        $user->update([
            'is_super_admin' => false,
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Super Admin access revoked successfully'
        ]);
    }
}
