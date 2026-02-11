<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderWorkflowTask;
use App\Models\WorkflowStage;
use App\Models\WorkflowTaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorkflowController extends Controller
{
    /**
     * Get Workflow list data (Order Item centric)
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');

        $query = OrderItem::query()
            ->with([
                'order:id,order_number,customer_id,priority_id,order_date,promised_delivery_date',
                'order.customer:id,first_name,last_name,display_name',
                'order.priority:id,name,color',
                'itemType:id,name',
                'currentWorkflowStage:id,name,color',
                'assignedWorker:id,first_name,last_name,display_name',
                'assignedUser:id,name',
                'workflowTasks:id,order_item_id,workflow_stage_id,status,due_date'
            ])
            ->whereHas('order', fn($q) => $q->where('tenant_id', $tenantId));

        // Apply filters
        if ($request->filled('priority_id')) {
            $query->whereHas('order', fn($q) => $q->where('priority_id', $request->priority_id));
        }

        if ($request->filled('worker_id')) {
            $query->where('assigned_worker_id', $request->worker_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('order', function($sq) use ($search) {
                    $sq->where('order_number', 'like', "%{$search}%")
                       ->orWhereHas('customer', function($csq) use ($search) {
                           $csq->where('first_name', 'like', "%{$search}%")
                               ->orWhere('last_name', 'like', "%{$search}%")
                               ->orWhere('display_name', 'like', "%{$search}%");
                       });
                })->orWhere('item_name', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sort_by = $request->get('sort_by', 'created_at');
        $sort_dir = $request->get('sort_dir', 'desc');

        if ($sort_by === 'order.order_number') {
            $query->orderBy(
                Order::select('order_number')
                    ->whereColumn('orders.id', 'order_items.order_id')
                    ->limit(1),
                $sort_dir
            );
        } elseif ($sort_by === 'order.promised_delivery_date') {
            $query->orderBy(
                Order::select('promised_delivery_date')
                    ->whereColumn('orders.id', 'order_items.order_id')
                    ->limit(1),
                $sort_dir
            );
        } elseif ($sort_by === 'assigned_worker.display_name') {
            $query->join('workers', 'order_items.assigned_worker_id', '=', 'workers.id')
                ->orderBy('workers.display_name', $sort_dir)
                ->select('order_items.*');
        } elseif (in_array($sort_by, ['item_name', 'status', 'created_at'])) {
            $query->orderBy($sort_by, $sort_dir);
        } else {
            $query->latest();
        }

        $items = $query->paginate($request->get('per_page', 15));

        return response()->json($items);
    }

    /**
     * Get Kanban board data
     */
    public function board(Request $request): JsonResponse
    {
        $tenantId = app('tenant_id');

        // Get all workflow stages
        $stages = WorkflowStage::where('is_active', true)
            ->orderBy('stage_order')
            ->get();

        // Get tasks grouped by stage
        $tasksQuery = OrderWorkflowTask::query()
            ->with([
                'order:id,order_number,customer_id,priority_id',
                'order.customer:id,first_name,last_name,display_name',
                'order.priority:id,name,color',
                'orderItem:id,item_type_id',
                'orderItem.itemType:id,name',
                'assignedToUser:id,name',
                'assignedToWorker:id,first_name,last_name,display_name',
            ]);

        // Apply filters
        if ($request->filled('priority_id')) {
            $tasksQuery->whereHas('order', fn($q) => $q->where('priority_id', $request->priority_id));
        }

        if ($request->filled('assignee_user_id')) {
            $tasksQuery->where('assigned_to_user_id', $request->assignee_user_id);
        }

        if ($request->filled('assignee_worker_id')) {
            $tasksQuery->where('assigned_to_worker_id', $request->assignee_worker_id);
        }

        if ($request->filled('due_date_from')) {
            $tasksQuery->whereDate('due_date', '>=', $request->due_date_from);
        }

        if ($request->filled('due_date_to')) {
            $tasksQuery->whereDate('due_date', '<=', $request->due_date_to);
        }

        // Only show non-completed tasks by default
        if (!$request->boolean('include_completed')) {
            $tasksQuery->whereNotIn('status', ['completed', 'skipped']);
        }

        // Limit total tasks to prevent memory issues, then group
        $tasks = $tasksQuery->latest()
            ->get()
            ->groupBy('workflow_stage_id');

        // Build board data
        $board = $stages->map(fn($stage) => [
            'id' => $stage->id,
            'name' => $stage->name,
            'code' => $stage->code,
            'color' => $stage->color,
            'is_mandatory' => $stage->is_mandatory,
            'requires_photo' => $stage->requires_photo,
            'stage_order' => $stage->stage_order,
            'tasks' => ($tasks[$stage->id] ?? collect())->take(20)->map(fn($task) => [
                'id' => $task->id,
                'order_id' => $task->order_id,
                'order_number' => $task->order->order_number,
                'customer_name' => $task->order->customer->name,
                'item_name' => $task->orderItem?->itemType?->name ?? 'Order Level',
                'priority' => $task->order->priority->name ?? 'Normal',
                'priority_color' => $task->order->priority->color ?? '#64748b',
                'status' => $task->status,
                'due_date' => $task->due_date?->format('Y-m-d'),
                'is_overdue' => $task->due_date && $task->due_date->isPast() && $task->status !== 'completed',
                'assigned_to' => $task->assignedToUser?->name ?? $task->assignedToWorker?->name,
                'has_photos' => !empty($task->photos),
                'photo_verified' => $task->photo_verified,
            ])->values(),
        ]);

        return response()->json([
            'data' => $board,
        ]);
    }

    /**
     * Get tasks for current user
     */
    public function tasks(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenantId = app('tenant_id');

        $query = OrderWorkflowTask::query()
            ->with([
                'workflowStage',
                'order.customer',
                'order.priority',
                'orderItem.itemType',
            ])
            ->whereHas('order', fn($q) => $q->where('tenant_id', $tenantId));

        // Filter by assignment (for staff users)
        if (!$user->hasRole(['owner', 'manager'])) {
            $query->where('assigned_to_user_id', $user->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // Default to pending and in_progress
            $query->whereIn('status', ['pending', 'in_progress']);
        }

        // Filter by stage
        if ($request->has('stage_id')) {
            $query->where('workflow_stage_id', $request->stage_id);
        }

        // Filter overdue
        if ($request->boolean('overdue')) {
            $query->where('due_date', '<', now())
                ->whereNotIn('status', ['completed', 'skipped']);
        }

        // Sorting
        $query->orderBy('due_date', 'asc')->orderBy('id', 'asc');

        $tasks = $query->paginate($request->get('per_page', 20));

        return response()->json($tasks);
    }

    /**
     * Get single task details
     */
    public function showTask(OrderWorkflowTask $task): JsonResponse
    {
        $task->load([
            'workflowStage',
            'order.customer',
            'order.priority',
            'order.status',
            'orderItem.itemType',
            'orderItem.fabrics',
            'orderItem.embellishments.workType',
            'assignedToUser',
            'assignedToWorker',
            'approvedBy',
            'completedBy',
            'comments.user',
        ]);

        return response()->json([
            'data' => $task,
        ]);
    }

    /**
     * Get single workflow item (OrderItem centric) details
     */
    public function showItem(OrderItem $item): JsonResponse
    {
        $item->load([
            'order.customer',
            'order.priority',
            'itemType',
            'fabrics',
            'embellishments.workType',
            'embellishments.worker',
            'stitchingSpecs',
            'currentWorkflowStage',
            'assignedWorker',
            'assignedUser',
            'workflowTasks.workflowStage',
            'workflowTasks.assignedToUser',
            'workflowTasks.assignedToWorker',
            'workflowTasks.comments.user',
        ]);

        return response()->json([
            'data' => $item,
        ]);
    }

    /**
     * Update task status
     */
    public function updateTaskStatus(Request $request, OrderWorkflowTask $task): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,skipped',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $updates = ['status' => $validated['status']];

        if (!empty($validated['notes'])) {
            $updates['notes'] = $validated['notes'];
        }

        // Handle status transitions
        switch ($validated['status']) {
            case 'in_progress':
                if (!$task->started_at) {
                    $updates['started_at'] = now();
                }
                break;

            case 'completed':
                $updates['completed_at'] = now();
                $updates['completed_by_user_id'] = $user->id;

                // Check if photo is required but not uploaded
                if ($task->workflowStage->requires_photo && empty($task->photos)) {
                    return response()->json([
                        'message' => 'This stage requires a photo before completion',
                    ], 422);
                }

                // Check if approval is required
                if ($task->requires_approval && !$task->is_approved) {
                    return response()->json([
                        'message' => 'This task requires approval before completion',
                    ], 422);
                }

                // Update order item's current workflow stage to next stage
                $this->advanceToNextStage($task);
                break;

            case 'skipped':
                // Only managers/owners can skip mandatory stages
                if ($task->workflowStage->is_mandatory && !$user->hasRole(['owner', 'manager'])) {
                    return response()->json([
                        'message' => 'Only managers can skip mandatory stages',
                    ], 403);
                }
                $updates['completed_at'] = now();
                $updates['completed_by_user_id'] = $user->id;
                break;
        }

        $task->update($updates);

        return response()->json([
            'message' => 'Task status updated successfully',
            'data' => $task->fresh()->load('workflowStage'),
        ]);
    }

    /**
     * Assign task to user or worker
     */
    public function assignTask(Request $request, OrderWorkflowTask $task): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'worker_id' => 'nullable|exists:workers,id',
            'due_date' => 'nullable|date',
        ]);

        $task->update([
            'assigned_to_user_id' => $validated['user_id'] ?? null,
            'assigned_to_worker_id' => $validated['worker_id'] ?? null,
            'due_date' => $validated['due_date'] ?? $task->due_date,
        ]);

        if ($task->orderItem) {
            $updateData = [
                'assigned_worker_id' => $validated['worker_id'] ?? null,
                'assigned_user_id' => $validated['user_id'] ?? null,
            ];

            // Ensure item_name is populated if current null
            if (empty($task->orderItem->item_name) && $task->orderItem->itemType) {
                $updateData['item_name'] = $task->orderItem->itemType->name;
            }

            $task->orderItem->update($updateData);
        }

        return response()->json([
            'message' => 'Task assigned successfully',
            'data' => $task->fresh()->load(['assignedToUser', 'assignedToWorker']),
        ]);
    }

    /**
     * Add comment to task
     */
    public function addComment(Request $request, OrderWorkflowTask $task): JsonResponse
    {
        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
            'attachment_url' => 'nullable|string|max:255',
        ]);

        $comment = WorkflowTaskComment::create([
            'workflow_task_id' => $task->id,
            'user_id' => $request->user()->id,
            'comment' => $validated['comment'],
            'attachment_url' => $validated['attachment_url'] ?? null,
        ]);

        return response()->json([
            'message' => 'Comment added successfully',
            'data' => $comment->load('user'),
        ], 201);
    }

    /**
     * Upload photos for task
     */
    public function uploadPhotos(Request $request, OrderWorkflowTask $task): JsonResponse
    {
        $validated = $request->validate([
            'photos' => 'required|array|max:5',
            'photos.*' => 'required|image|max:5120', // 5MB max per image
        ]);

        $uploadedPhotos = $task->photos ?? [];

        foreach ($request->file('photos') as $photo) {
            $path = $photo->store('workflow-photos/' . $task->order_id, 'public');
            $uploadedPhotos[] = [
                'url' => Storage::url($path),
                'path' => $path,
                'uploaded_at' => now()->toISOString(),
                'uploaded_by' => $request->user()->id,
            ];
        }

        $task->update(['photos' => $uploadedPhotos]);

        return response()->json([
            'message' => 'Photos uploaded successfully',
            'data' => [
                'photos' => $uploadedPhotos,
            ],
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
            $nextTask = OrderWorkflowTask::where('order_item_id', $completedTask->order_item_id)
                ->where('workflow_stage_id', $nextStage->id)
                ->first();

            $completedTask->orderItem->update([
                'current_workflow_stage_id' => $nextStage->id,
                'assigned_worker_id' => $nextTask->assigned_to_worker_id ?? null,
                'assigned_user_id' => $nextTask->assigned_to_user_id ?? null,
            ]);
        }

        // Check if all tasks for the order are completed
        $pendingTasks = OrderWorkflowTask::where('order_id', $completedTask->order_id)
            ->whereNotIn('status', ['completed', 'skipped'])
            ->count();

        if ($pendingTasks === 0) {
            // All tasks completed - update order status to Ready
            $readyStatus = \App\Models\OrderStatus::where('code', 'READY')->first();
            if ($readyStatus) {
                $completedTask->order->update([
                    'status_id' => $readyStatus->id,
                ]);
            }
        }
    }
}
