<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    /**
     * List customers with filters
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Customer::query()
            ->with(['measurementProfiles'])
            ->withCount('orders');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('customer_code', 'like', "%{$search}%");
            });
        }

        // Filter by city
        if ($request->has('city')) {
            $query->where('city', $request->city);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        return CustomerResource::collection(
            $query->paginate($request->get('per_page', 15))
        );
    }

    /**
     * Create a new customer
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'mobile' => 'required|string|max:15',
            'alternate_mobile' => 'nullable|string|max:15',
            'email' => 'nullable|email|max:255',
            'whatsapp_number' => 'nullable|string|max:15',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'company_city' => 'nullable|string|max:100',
            'company_state' => 'nullable|string|max:100',
            'company_pincode' => 'nullable|string|max:10',
            'customer_type' => 'nullable|string|in:individual,business',
            'date_of_birth' => 'nullable|date',
            'anniversary_date' => 'nullable|date',
            'preferred_language' => 'nullable|string|in:en,gu,hi',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
        ]);

        // Handle names
        if (!empty($validated['name'])) {
            $nameParts = explode(' ', $validated['name'], 2);
            $validated['first_name'] = $nameParts[0];
            $validated['last_name'] = $nameParts[1] ?? '';
        }
        
        if (empty($validated['first_name']) && empty($validated['name'])) {
            return response()->json(['message' => 'The name or first name field is required.'], 422);
        }

        unset($validated['name']);

        // Generate customer code
        $validated['customer_code'] = $this->generateCustomerCode();

        $customer = Customer::create($validated);

        return response()->json([
            'message' => 'Customer created successfully',
            'data' => new CustomerResource($customer),
        ], 201);
    }

    /**
     * Get customer details
     */
    public function show(Customer $customer): CustomerResource
    {
        $customer->load([
            'measurementProfiles.latestRecord.values.measurementType',
            'orders' => fn($q) => $q->latest()->limit(5),
            'inquiries' => fn($q) => $q->latest()->limit(5),
        ]);

        return new CustomerResource($customer);
    }

    /**
     * Update customer
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'mobile' => 'sometimes|string|max:15',
            'alternate_mobile' => 'nullable|string|max:15',
            'email' => 'nullable|email|max:255',
            'whatsapp_number' => 'nullable|string|max:15',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'company_city' => 'nullable|string|max:100',
            'company_state' => 'nullable|string|max:100',
            'company_pincode' => 'nullable|string|max:10',
            'customer_type' => 'nullable|string|in:individual,business',
            'date_of_birth' => 'nullable|date',
            'anniversary_date' => 'nullable|date',
            'preferred_language' => 'nullable|string|in:en,gu,hi',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
            'status' => 'nullable|string|in:active,inactive,blocked',
        ]);

        if (!empty($validated['name'])) {
            $nameParts = explode(' ', $validated['name'], 2);
            $validated['first_name'] = $nameParts[0];
            $validated['last_name'] = $nameParts[1] ?? '';
        }
        unset($validated['name']);

        $customer->update($validated);

        return response()->json([
            'message' => 'Customer updated successfully',
            'data' => new CustomerResource($customer->fresh()),
        ]);
    }

    /**
     * Delete customer (soft delete)
     */
    public function destroy(Customer $customer): JsonResponse
    {
        // Check if customer has active orders
        if ($customer->orders()->whereNotIn('status', ['delivered', 'cancelled'])->exists()) {
            return response()->json([
                'message' => 'Cannot delete customer with active orders',
            ], 422);
        }

        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully',
        ]);
    }

    /**
     * Get customer orders
     */
    public function orders(Customer $customer): JsonResponse
    {
        $orders = $customer->orders()
            ->with(['items.itemType', 'status', 'priority'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $orders,
        ]);
    }

    /**
     * Get customer measurements
     */
    public function measurements(Customer $customer): JsonResponse
    {
        $profiles = $customer->measurementProfiles()
            ->with(['records.values.measurementType'])
            ->get();

        return response()->json([
            'data' => $profiles,
        ]);
    }

    /**
     * Get customer inquiries
     */
    public function inquiries(Customer $customer): JsonResponse
    {
        $inquiries = $customer->inquiries()
            ->with(['source', 'occasion'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $inquiries,
        ]);
    }

    /**
     * Generate unique customer code
     */
    private function generateCustomerCode(): string
    {
        $tenantId = app('tenant_id');

        $sequence = \App\Models\OrderNumberSequence::where('tenant_id', $tenantId)
            ->where('sequence_type', 'customer')
            ->first();

        if ($sequence) {
            return $sequence->getNextNumber();
        }

        // Fallback
        $lastCustomer = Customer::latest('id')->first();
        $nextNumber = $lastCustomer ? $lastCustomer->id + 1 : 1;

        return 'CUST-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
