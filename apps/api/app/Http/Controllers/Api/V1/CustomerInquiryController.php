<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InquiryResource;
use App\Models\Customer;
use App\Models\CustomerInquiry;
use App\Models\Order;
use App\Models\OrderNumberSequence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use App\Traits\ManagesWorkflow;

class CustomerInquiryController extends Controller
{
    use ManagesWorkflow;
    /**
     * List inquiries
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CustomerInquiry::query()
            ->with(['customer', 'source', 'occasion', 'budgetRange', 'itemType', 'assignedTo']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('inquiry_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_mobile', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by source
        if ($request->has('source_id')) {
            $query->where('source_id', $request->source_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        return InquiryResource::collection(
            $query->paginate($request->get('per_page', 15))
        );
    }

    /**
     * Create inquiry
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'required_without:customer_id|string|max:255',
            'customer_mobile' => 'required_without:customer_id|string|max:15',
            'customer_email' => 'nullable|email|max:255',
            'customer_type' => 'nullable|string|in:individual,business',
            'company_name' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'company_address' => 'nullable|string',
            'company_city' => 'nullable|string|max:100',
            'company_state' => 'nullable|string|max:100',
            'company_pincode' => 'nullable|string|max:10',
            'company_gst' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'source_id' => 'required|exists:inquiry_sources,id',
            'occasion_id' => 'nullable|exists:occasions,id',
            'budget_range_id' => 'nullable|exists:budget_ranges,id',
            'item_type_id' => 'nullable|exists:item_types,id',
            'requirements' => 'nullable|string',
            'event_date' => 'nullable|date',
            'preferred_delivery_date' => 'nullable|date',
            'reference_images' => 'nullable|array',
            'notes' => 'nullable|string',
            'assigned_to_user_id' => 'nullable|exists:users,id',
        ]);

        // Generate inquiry number
        $validated['inquiry_number'] = $this->generateInquiryNumber();
        $validated['tenant_id'] = app('tenant_id');
        $validated['status'] = 'new';
        $validated['created_by_user_id'] = $request->user()->id;

        $inquiry = CustomerInquiry::create($validated);

        return response()->json([
            'message' => 'Inquiry created successfully',
            'data' => new InquiryResource($inquiry->load(['customer', 'source', 'occasion'])),
        ], 201);
    }

    /**
     * Get inquiry details
     */
    public function show(CustomerInquiry $inquiry): InquiryResource
    {
        $inquiry->load([
            'customer',
            'source',
            'occasion',
            'budgetRange',
            'itemType',
            'assignedTo',
            'createdBy',
            'convertedOrder',
        ]);

        return new InquiryResource($inquiry);
    }

    /**
     * Update inquiry
     */
    public function update(Request $request, CustomerInquiry $inquiry): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'sometimes|string|max:255',
            'customer_mobile' => 'sometimes|string|max:15',
            'customer_email' => 'nullable|email|max:255',
            'customer_type' => 'nullable|string|in:individual,business',
            'company_name' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'company_address' => 'nullable|string',
            'company_city' => 'nullable|string|max:100',
            'company_state' => 'nullable|string|max:100',
            'company_pincode' => 'nullable|string|max:10',
            'company_gst' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'source_id' => 'sometimes|exists:inquiry_sources,id',
            'occasion_id' => 'nullable|exists:occasions,id',
            'budget_range_id' => 'nullable|exists:budget_ranges,id',
            'item_type_id' => 'nullable|exists:item_types,id',
            'requirements' => 'nullable|string',
            'event_date' => 'nullable|date',
            'preferred_delivery_date' => 'nullable|date',
            'reference_images' => 'nullable|array',
            'notes' => 'nullable|string',
            'assigned_to_user_id' => 'nullable|exists:users,id',
        ]);

        $inquiry->update($validated);

        return response()->json([
            'message' => 'Inquiry updated successfully',
            'data' => new InquiryResource($inquiry->fresh()->load(['customer', 'source', 'occasion', 'itemType'])),
        ]);
    }

    /**
     * Delete inquiry
     */
    public function destroy(CustomerInquiry $inquiry): JsonResponse
    {
        if ($inquiry->status === 'converted') {
            return response()->json([
                'message' => 'Cannot delete converted inquiry',
            ], 422);
        }

        $inquiry->delete();

        return response()->json([
            'message' => 'Inquiry deleted successfully',
        ]);
    }

    /**
     * Update inquiry status
     */
    public function updateStatus(Request $request, CustomerInquiry $inquiry): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:new,contacted,follow_up,interested,not_interested,converted,closed',
            'follow_up_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $inquiry->update([
            'status' => $validated['status'],
            'follow_up_date' => $validated['follow_up_date'] ?? $inquiry->follow_up_date,
            'notes' => $validated['notes'] ?? $inquiry->notes,
        ]);

        return response()->json([
            'message' => 'Status updated successfully',
            'data' => $inquiry->fresh(),
        ]);
    }

    /**
     * Convert inquiry to order
     */
    public function convertToOrder(Request $request, CustomerInquiry $inquiry): JsonResponse
    {
        if ($inquiry->status === 'converted') {
            return response()->json([
                'message' => 'Inquiry has already been converted',
            ], 422);
        }

        $validated = $request->validate([
            'create_customer' => 'boolean',
            'customer_id' => 'nullable|exists:customers,id',
            'order_date' => 'required|date',
            'promised_delivery_date' => 'required|date|after_or_equal:order_date',
            'event_date' => 'nullable|date|after_or_equal:order_date',
            'priority_id' => 'required|exists:order_priorities,id',
            'items' => 'required|array|min:1',
            'items.*.item_type_id' => 'required|exists:item_types,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.description' => 'nullable|string',
            // Delivery override fields
            'delivery_address_line1' => 'nullable|string',
            'delivery_address_line2' => 'nullable|string',
            'delivery_city' => 'nullable|string',
            'delivery_state' => 'nullable|string',
            'delivery_pincode' => 'nullable|string',
            'use_customer_address' => 'boolean',
        ]);

        return DB::transaction(function () use ($inquiry, $validated, $request) {
            $customerId = $validated['customer_id'] ?? $inquiry->customer_id;

            // Create customer if needed
            if (!$customerId && ($validated['create_customer'] ?? true)) {
                $nameParts = explode(' ', $inquiry->customer_name, 2);
                $customer = Customer::create([
                    'tenant_id' => app('tenant_id'),
                    'customer_code' => $this->generateCustomerCode(),
                    'first_name' => $nameParts[0],
                    'last_name' => $nameParts[1] ?? '',
                    'company_name' => $inquiry->company_name,
                    'designation' => $inquiry->designation,
                    'company_address' => $inquiry->company_address,
                    'company_city' => $inquiry->company_city,
                    'company_state' => $inquiry->company_state,
                    'company_pincode' => $inquiry->company_pincode,
                    'mobile' => $inquiry->customer_mobile,
                    'email' => $inquiry->customer_email,
                    'address' => $inquiry->address,
                    'city' => $inquiry->city,
                    'state' => $inquiry->state,
                    'pincode' => $inquiry->pincode,
                    'gst_number' => $inquiry->company_gst,
                    'customer_type' => $inquiry->customer_type ?? ($inquiry->company_name ? 'business' : 'individual'),
                ]);
                $customerId = $customer->id;

                // Link customer to inquiry
                $inquiry->update(['customer_id' => $customerId]);
            }

            if (!$customerId) {
                return response()->json([
                    'message' => 'Customer is required to create an order',
                ], 422);
            }

            // Generate order number
            $orderNumber = $this->generateOrderNumber();

            // Get default status
            // Get default status
            $defaultStatus = DB::table('order_statuses')
                ->where('tenant_id', app('tenant_id'))
                ->where('is_default', true)
                ->first() ?: DB::table('order_statuses')
                ->where('tenant_id', app('tenant_id'))
                ->where('code', 'DRAFT')
                ->first() ?: DB::table('order_statuses')
                ->where('tenant_id', app('tenant_id'))
                ->first();

            // Create order
            $order = Order::create([
                'tenant_id' => app('tenant_id'),
                'order_number' => $orderNumber,
                'customer_id' => $customerId,
                'occasion_id' => $inquiry->occasion_id,
                'status_id' => $defaultStatus->id,
                'priority_id' => $validated['priority_id'],
                'order_date' => $validated['order_date'],
                'promised_delivery_date' => $validated['promised_delivery_date'],
                'event_date' => $validated['event_date'] ?? $inquiry->event_date,
                'delivery_address_line1' => $validated['delivery_address_line1'] ?? $inquiry->address,
                'delivery_address_line2' => $validated['delivery_address_line2'] ?? null,
                'delivery_city' => $validated['delivery_city'] ?? $inquiry->city,
                'delivery_state' => $validated['delivery_state'] ?? $inquiry->state,
                'delivery_pincode' => $validated['delivery_pincode'] ?? $inquiry->pincode,
                'use_customer_address' => $validated['use_customer_address'] ?? (!isset($validated['delivery_address_line1'])),
                'special_instructions' => $inquiry->requirements,
                'inquiry_id' => $inquiry->id,
                'created_by_user_id' => $request->user()->id,
                'subtotal' => collect($validated['items'])->sum(fn($i) => $i['quantity'] * $i['unit_price']),
                'total_amount' => collect($validated['items'])->sum(fn($i) => $i['quantity'] * $i['unit_price']),
            ]);

            // Create order items
            foreach ($validated['items'] as $itemData) {
                $order->items()->create([
                    'tenant_id' => app('tenant_id'),
                    'item_type_id' => $itemData['item_type_id'],
                    'item_name' => $itemData['item_name'] ?? DB::table('item_types')->where('id', $itemData['item_type_id'])->value('name'),
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['quantity'] * $itemData['unit_price'],
                    'description' => $itemData['description'] ?? '',
                ]);
            }

            // Create workflow tasks for the order
            $this->createWorkflowTasks($order);

            // Update inquiry status
            $inquiry->update([
                'status' => 'converted',
                'converted_order_id' => $order->id,
                'converted_at' => now(),
            ]);

            return response()->json([
                'message' => 'Inquiry converted to order successfully',
                'data' => [
                    'inquiry' => $inquiry->fresh(),
                    'order' => $order->load(['customer', 'status', 'priority']),
                ],
            ], 201);
        });
    }

    /**
     * Generate inquiry number
     */
    private function generateInquiryNumber(): string
    {
        $tenantId = app('tenant_id');

        $sequence = OrderNumberSequence::where('tenant_id', $tenantId)
            ->where('sequence_type', 'inquiry')
            ->first();

        if ($sequence) {
            return $sequence->getNextNumber();
        }

        // Fallback
        $lastInquiry = CustomerInquiry::latest('id')->first();
        $nextNumber = $lastInquiry ? $lastInquiry->id + 1 : 1;

        return 'INQ-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function generateCustomerCode(): string
    {
        $tenantId = app('tenant_id');

        $sequence = OrderNumberSequence::where('tenant_id', $tenantId)
            ->where('sequence_type', 'customer')
            ->first();

        if ($sequence) {
            return $sequence->getNextNumber();
        }

        $lastCustomer = Customer::latest('id')->first();
        $nextNumber = $lastCustomer ? $lastCustomer->id + 1 : 1;

        return 'CUST-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function generateOrderNumber(): string
    {
        $tenantId = app('tenant_id');

        $sequence = OrderNumberSequence::where('tenant_id', $tenantId)
            ->where('sequence_type', 'order')
            ->first();

        if ($sequence) {
            return $sequence->getNextNumber();
        }

        $lastOrder = Order::latest('id')->first();
        $nextNumber = $lastOrder ? $lastOrder->id + 1 : 1;

        return 'ORD-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
