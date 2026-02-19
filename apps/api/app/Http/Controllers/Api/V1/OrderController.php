<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\ItemCostEstimate;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderNumberSequence;
use App\Models\OrderPaymentSummary;
use App\Models\OrderWorkflowTask;
use App\Models\WorkflowStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use App\Traits\ManagesWorkflow;

class OrderController extends Controller
{
    use ManagesWorkflow;
    /**
     * List orders with filters
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::query()
            ->with(['customer', 'status', 'priority', 'items.itemType'])
            ->withCount('items');

        // Search by order number or customer
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($q) => $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('display_name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%"));
            });
        }

        // Filter by status
        if ($request->has('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        // Filter by priority
        if ($request->has('priority_id')) {
            $query->where('priority_id', $request->priority_id);
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Filter by delivery date
        if ($request->has('delivery_from')) {
            $query->whereDate('promised_delivery_date', '>=', $request->delivery_from);
        }
        if ($request->has('delivery_to')) {
            $query->whereDate('promised_delivery_date', '<=', $request->delivery_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        
        // Handle nested relationship sorting - these are not supported, default to created_at
        $validSortColumns = ['order_number', 'items_count', 'total_amount', 'promised_delivery_date', 'created_at', 'updated_at'];
        if (!in_array($sortBy, $validSortColumns)) {
            $sortBy = 'created_at';
        }
        
        $query->orderBy($sortBy, $sortDir);

        return OrderResource::collection(
            $query->paginate($request->get('per_page', 15))
        );
    }

    /**
     * Create a new order
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'measurement_profile_id' => 'nullable|exists:measurement_profiles,id',
            'occasion_id' => 'nullable|exists:occasions,id',
            'priority_id' => 'required|exists:order_priorities,id',
            'promised_delivery_date' => 'required|date|after:today',
            'special_instructions' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_type_id' => 'required|exists:item_types,id',
            'items.*.item_name' => 'nullable|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Generate order number
            $orderNumber = $this->generateOrderNumber();

            // Get default status (Draft)
            $defaultStatus = DB::table('order_statuses')
                ->where('tenant_id', app('tenant_id'))
                ->where('is_default', true)
                ->first();

            // Create order
            $order = Order::create([
                'tenant_id' => app('tenant_id'),
                'order_number' => $orderNumber,
                'customer_id' => $validated['customer_id'],
                'measurement_profile_id' => $validated['measurement_profile_id'] ?? null,
                'occasion_id' => $validated['occasion_id'] ?? null,
                'status_id' => $defaultStatus->id,
                'priority_id' => $validated['priority_id'],
                'order_date' => now(),
                'promised_delivery_date' => $validated['promised_delivery_date'],
                'special_instructions' => $validated['special_instructions'] ?? null,
                'created_by_user_id' => $request->user()->id,
            ]);

            // Create order items
            $subtotal = 0;
            foreach ($validated['items'] as $index => $itemData) {
                $itemTotal = $itemData['quantity'] * $itemData['unit_price'];
                $subtotal += $itemTotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'item_type_id' => $itemData['item_type_id'],
                    'item_name' => $itemData['item_name'] ?? DB::table('item_types')->where('id', $itemData['item_type_id'])->value('name'),
                    'description' => $itemData['description'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemTotal,
                    'display_order' => $index + 1,
                    'status' => 'pending',
                ]);
            }

            // Update order totals
            $order->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal, // Will be updated with taxes later
            ]);

            // Create payment summary
            OrderPaymentSummary::create([
                'order_id' => $order->id,
                'total_order_amount' => $subtotal,
                'total_paid_amount' => 0,
                'pending_amount' => $subtotal,
            ]);

            // Create workflow tasks for each item
            $this->createWorkflowTasks($order);

            return response()->json([
                'message' => 'Order created successfully',
                'data' => new OrderResource($order->load([
                    'customer',
                    'status',
                    'priority',
                    'items.itemType',
                ])),
            ], 201);
        });
    }

    /**
     * Get order details
     */
    public function show(Order $order): OrderResource
    {
        $order->load([
            'customer',
            'measurementProfile.latestRecord.measurementValues.measurementType',
            'status',
            'priority',
            'occasion',
            'items.itemType',
            'items.fabrics',
            'items.embellishments.workType',
            'items.embellishments.worker',
            'items.stitchingSpecs',
            'items.additionalWorks',
            'items.costEstimate',
            'items.currentWorkflowStage',
            'workflowTasks.workflowStage',
            'paymentSummary',
            'createdBy',
        ]);

        return new OrderResource($order);
    }

    /**
     * Update order
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'measurement_profile_id' => 'nullable|exists:measurement_profiles,id',
            'occasion_id' => 'nullable|exists:occasions,id',
            'priority_id' => 'sometimes|exists:order_priorities,id',
            'promised_delivery_date' => 'sometimes|date',
            'special_instructions' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        $order->update($validated);

        // Recalculate totals if discount changed
        if (isset($validated['discount_amount'])) {
            $order->recalculateTotals();
        }

        return response()->json([
            'message' => 'Order updated successfully',
            'data' => new OrderResource($order->fresh()->load([
                'customer',
                'status',
                'priority',
                'items.itemType',
            ])),
        ]);
    }

    /**
     * Delete order (soft delete)
     */
    public function destroy(Order $order): JsonResponse
    {
        // Only allow deleting draft and cancelled orders
        if (!in_array($order->status->code, ['DRAFT', 'CANCELLED'])) {
            return response()->json([
                'message' => 'Only draft and cancelled orders can be deleted',
            ], 422);
        }

        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully',
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status_id' => 'required|exists:order_statuses,id',
            'notes' => 'nullable|string',
        ]);

        $order->update([
            'status_id' => $validated['status_id'],
        ]);

        // If status is CONFIRMED, automate workflow
        $status = $order->status()->first();
        if ($status && $status->code === 'CONFIRMED') {
            $this->handleOrderConfirmation($order);
        }

        return response()->json([
            'message' => 'Order status updated successfully',
            'data' => $order->fresh()->load('status'),
        ]);
    }

    /**
     * Get order workflow
     */
    public function workflow(Order $order): JsonResponse
    {
        $tasks = $order->workflowTasks()
            ->with(['workflowStage', 'orderItem.itemType', 'assignedToUser', 'assignedToWorker'])
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $tasks,
        ]);
    }

    /**
     * Get order payments
     */
    public function payments(Order $order): JsonResponse
    {
        $payments = $order->payments()
            ->with(['receivedBy'])
            ->latest('payment_date')
            ->get();

        $summary = $order->paymentSummary;

        return response()->json([
            'summary' => $summary,
            'payments' => $payments,
        ]);
    }

    /**
     * Get order invoices
     */
    public function invoices(Order $order): JsonResponse
    {
        $invoices = $order->invoices()
            ->latest('invoice_date')
            ->get();

        return response()->json([
            'data' => $invoices,
        ]);
    }

    /**
     * Add item to order
     */
    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'item_type_id' => 'required|exists:item_types,id',
            'item_name' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $itemTotal = $validated['quantity'] * $validated['unit_price'];

        $item = OrderItem::create([
            'order_id' => $order->id,
            'item_type_id' => $validated['item_type_id'],
            'item_name' => $validated['item_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'quantity' => $validated['quantity'],
            'unit_price' => $validated['unit_price'],
            'total_price' => $itemTotal,
            'display_order' => $order->items()->count() + 1,
            'status' => 'pending',
        ]);

        // Recalculate order totals
        $order->recalculateTotals();

        // Create workflow tasks for new item
        $this->createWorkflowTasksForItem($order, $item);

        return response()->json([
            'message' => 'Item added successfully',
            'data' => $item->load('itemType'),
        ], 201);
    }

    /**
     * Update order item
     */
    public function updateItem(Request $request, OrderItem $item): JsonResponse
    {
        $validated = $request->validate([
            'item_name' => 'nullable|string|max:255',
            'quantity' => 'sometimes|integer|min:1',
            'unit_price' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'special_instructions' => 'nullable|string',
        ]);

        $item->update($validated);

        if (isset($validated['quantity']) || isset($validated['unit_price'])) {
            $item->update([
                'total_price' => $item->quantity * $item->unit_price,
            ]);
            $item->order->recalculateTotals();
        }

        return response()->json([
            'message' => 'Item updated successfully',
            'data' => $item->fresh()->load('itemType'),
        ]);
    }

    /**
     * Delete order item
     */
    public function deleteItem(OrderItem $item): JsonResponse
    {
        $order = $item->order;

        $item->delete();

        // Recalculate order totals
        $order->recalculateTotals();

        return response()->json([
            'message' => 'Item deleted successfully',
        ]);
    }

    /**
     * Update item fabrics
     */
    public function updateItemFabrics(Request $request, OrderItem $item): JsonResponse
    {
        $validated = $request->validate([
            'fabrics' => 'required|array',
            'fabrics.*.fabric_type' => 'required|string|max:100',
            'fabrics.*.fabric_description' => 'nullable|string',
            'fabrics.*.color' => 'nullable|string|max:50',
            'fabrics.*.quantity_meters' => 'nullable|numeric|min:0',
            'fabrics.*.is_customer_provided' => 'boolean',
            'fabrics.*.fabric_cost' => 'nullable|numeric|min:0',
        ]);

        // Delete existing and create new
        $item->fabrics()->delete();

        foreach ($validated['fabrics'] as $fabricData) {
            $item->fabrics()->create(array_merge($fabricData, [
                'tenant_id' => app('tenant_id'),
            ]));
        }

        return response()->json([
            'message' => 'Fabrics updated successfully',
            'data' => $item->fresh()->load('fabrics'),
        ]);
    }

    /**
     * Update item embellishments
     */
    public function updateItemEmbellishments(Request $request, OrderItem $item): JsonResponse
    {
        $validated = $request->validate([
            'embellishments' => 'required|array',
            'embellishments.*.work_type_id' => 'required|exists:work_types,id',
            'embellishments.*.worker_id' => 'nullable|exists:workers,id',
            'embellishments.*.description' => 'nullable|string',
            'embellishments.*.estimated_cost' => 'nullable|numeric|min:0',
            'embellishments.*.estimated_days' => 'nullable|integer|min:0',
            'embellishments.*.zones' => 'nullable|array',
            'embellishments.*.zones.*' => 'exists:embellishment_zones,id',
        ]);

        // Delete existing and create new
        $item->embellishments()->delete();

        foreach ($validated['embellishments'] as $embData) {
            $zones = $embData['zones'] ?? [];
            unset($embData['zones']);

            $embellishment = $item->embellishments()->create(array_merge($embData, [
                'tenant_id' => app('tenant_id'),
                'status' => 'pending',
            ]));

            // Create zone mappings
            foreach ($zones as $zoneId) {
                $embellishment->zones()->create([
                    'embellishment_zone_id' => $zoneId,
                ]);
            }
        }

        return response()->json([
            'message' => 'Embellishments updated successfully',
            'data' => $item->fresh()->load('embellishments.zones'),
        ]);
    }

    /**
     * Update item stitching specs
     */
    public function updateItemStitching(Request $request, OrderItem $item): JsonResponse
    {
        $validated = $request->validate([
            'stitching_type' => 'nullable|string|max:100',
            'lining_required' => 'boolean',
            'lining_type' => 'nullable|string|max:100',
            'padding_required' => 'boolean',
            'padding_areas' => 'nullable|array',
            'zipper_type' => 'nullable|string|max:50',
            'zipper_position' => 'nullable|string|max:50',
            'hook_type' => 'nullable|string|max:50',
            'dori_required' => 'boolean',
            'elastic_required' => 'boolean',
            'elastic_areas' => 'nullable|array',
            'special_instructions' => 'nullable|string',
            'estimated_cost' => 'nullable|numeric|min:0',
            'estimated_days' => 'nullable|integer|min:0',
        ]);

        $item->stitchingSpecs()->updateOrCreate(
            ['order_item_id' => $item->id],
            array_merge($validated, ['tenant_id' => app('tenant_id')])
        );

        return response()->json([
            'message' => 'Stitching specs updated successfully',
            'data' => $item->fresh()->load('stitchingSpecs'),
        ]);
    }

    /**
     * Get cost estimate for item
     */
    public function getCostEstimate(OrderItem $item): JsonResponse
    {
        $estimate = $item->costEstimate;

        if (!$estimate) {
            return response()->json([
                'data' => null,
            ]);
        }

        return response()->json([
            'data' => $estimate,
        ]);
    }

    /**
     * Update cost estimate for item
     */
    public function updateCostEstimate(Request $request, OrderItem $item): JsonResponse
    {
        $validated = $request->validate([
            'fabric_cost' => 'nullable|numeric|min:0',
            'embellishment_cost' => 'nullable|numeric|min:0',
            'stitching_cost' => 'nullable|numeric|min:0',
            'additional_work_cost' => 'nullable|numeric|min:0',
            'staff_expense' => 'nullable|numeric|min:0',
            'packing_cost' => 'nullable|numeric|min:0',
            'other_cost' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'estimated_total_days' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $estimate = $item->costEstimate()->updateOrCreate(
            ['order_item_id' => $item->id],
            array_merge($validated, ['tenant_id' => app('tenant_id')])
        );

        // Calculate totals
        $estimate->calculateTotalCost();
        $estimate->calculateProfit();
        $estimate->save();

        return response()->json([
            'message' => 'Cost estimate updated successfully',
            'data' => $estimate->fresh(),
        ]);
    }

    /**
     * Generate order number
     */
    private function generateOrderNumber(): string
    {
        $tenantId = app('tenant_id');

        $sequence = OrderNumberSequence::where('tenant_id', $tenantId)
            ->where('sequence_type', 'order')
            ->first();

        if ($sequence) {
            return $sequence->getNextNumber();
        }

        // Fallback
        $lastOrder = Order::latest('id')->first();
        $nextNumber = $lastOrder ? $lastOrder->id + 1 : 1;

        return 'ORD-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Handle order confirmation automation
     */
    private function handleOrderConfirmation(Order $order): void
    {
        $orderReceivedStage = WorkflowStage::where('code', 'ORDER_RECEIVED')->first();
        
        if ($orderReceivedStage) {
            $tasks = OrderWorkflowTask::where('order_id', $order->id)
                ->where('workflow_stage_id', $orderReceivedStage->id)
                ->where('status', 'pending')
                ->get();

            foreach ($tasks as $task) {
                $task->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'completed_by_user_id' => auth()->id() ?? $order->created_by_user_id,
                    'notes' => 'Automatically completed upon order confirmation',
                ]);

                $this->advanceToNextStage($task);
            }
        }

        $order->update([
            'confirmed_at' => now(),
        ]);
    }

    /**
     * Advance order item to next workflow stage
     */
    private function advanceToNextStage(OrderWorkflowTask $completedTask): void
    {
        $currentStage = $completedTask->workflowStage;

        // Find next stage
        $nextStage = WorkflowStage::where('stage_order', '>', $currentStage->stage_order)
            ->where('is_active', true)
            ->orderBy('stage_order')
            ->first();

        if ($nextStage && $completedTask->orderItem) {
            $completedTask->orderItem->update([
                'current_workflow_stage_id' => $nextStage->id,
            ]);
        }
    }
}
