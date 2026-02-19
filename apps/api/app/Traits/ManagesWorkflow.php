<?php

namespace App\Traits;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderWorkflowTask;
use App\Models\WorkflowStage;

trait ManagesWorkflow
{
    /**
     * Create workflow tasks for an entire order
     */
    protected function createWorkflowTasks(Order $order): void
    {
        $stages = WorkflowStage::where('is_active', true)
            ->orderBy('stage_order')
            ->get();

        foreach ($order->items as $item) {
            $this->createWorkflowTasksForItem($order, $item, $stages);
        }
    }

    /**
     * Create workflow tasks for a single order item
     */
    protected function createWorkflowTasksForItem(Order $order, OrderItem $item, $stages = null): void
    {
        if (!$stages) {
            $stages = WorkflowStage::where('is_active', true)
                ->orderBy('stage_order')
                ->get();
        }

        // Define mapping of stage codes to worker types for auto-assignment
        $assignmentMap = [
            'CUTTING' => 'Cutter',
            'CUTTING_COMPLETE' => 'Cutter',
            'EMBROIDERY_IN_PROGRESS' => 'Embroiderer',
            'EMBROIDERY_COMPLETE' => 'Embroiderer',
            'STITCHING_IN_PROGRESS' => 'Tailor',
            'STITCHING_COMPLETE' => 'Tailor',
            'ALTERATIONS' => 'Tailor',
            'FINISHING' => 'Finisher',
            'IRONING_PRESSING' => 'Finisher',
        ];

        foreach ($stages as $stage) {
            $workerId = null;

            // Attempt auto-assignment if stage is in our map
            if (isset($assignmentMap[$stage->code])) {
                $targetType = $assignmentMap[$stage->code];
                $workerId = \App\Models\Worker::where('tenant_id', $order->tenant_id)
                    ->where('worker_type', $targetType)
                    ->where('is_active', true)
                    ->first()?->id;
            }

            OrderWorkflowTask::create([
                'tenant_id' => $order->tenant_id,
                'order_id' => $order->id,
                'order_item_id' => $item->id,
                'workflow_stage_id' => $stage->id,
                'status' => 'pending',
                'assigned_to_worker_id' => $workerId,
                'requires_approval' => $stage->requires_approval ?? false,
            ]);
        }


        // Set the current workflow stage of the item to the first stage
        if ($stages->isNotEmpty() && !$item->current_workflow_stage_id) {
            $item->update([
                'current_workflow_stage_id' => $stages->first()->id,
            ]);
        }
    }
}
