<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $items = \App\Models\OrderItem::with('order')->get();
        $stages = \App\Models\WorkflowStage::where('is_active', true)->orderBy('stage_order')->get();

        foreach ($items as $item) {
            $existingTasksCount = \App\Models\OrderWorkflowTask::where('order_item_id', $item->id)->count();
            
            if ($existingTasksCount === 0) {
                foreach ($stages as $stage) {
                    \App\Models\OrderWorkflowTask::create([
                        'tenant_id' => $item->tenant_id ?? ($item->order->tenant_id ?? 1),
                        'order_id' => $item->order_id,
                        'order_item_id' => $item->id,
                        'workflow_stage_id' => $stage->id,
                        'status' => 'pending',
                        'requires_approval' => $stage->requires_approval ?? false,
                    ]);
                }

                // If no current stage set, set it to the first stage
                if ($stages->isNotEmpty() && !$item->current_workflow_stage_id) {
                    $item->update([
                        'current_workflow_stage_id' => $stages->first()->id,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No easy way to distinguish between automatically created and manually created tasks
        // but since this is a data correction migration, we usually don't rollback data inserts
    }
};
