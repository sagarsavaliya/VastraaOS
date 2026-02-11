<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_workflow_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('workflow_stage_id')->constrained()->onDelete('restrict');

            // Status
            $table->enum('status', [
                'pending',
                'in_progress',
                'completed',
                'skipped',
                'blocked'
            ])->default('pending');

            // Assignment
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('assigned_to_worker_id')->nullable()->constrained('workers')->onDelete('set null');

            // Dates
            $table->date('due_date')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            // Details
            $table->text('notes')->nullable();
            $table->json('photos')->nullable(); // Required photos for certain stages
            $table->boolean('photo_verified')->default(false);

            // Approval (if stage requires approval)
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_approved')->nullable();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();

            // Tracking
            $table->foreignId('completed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['order_id', 'order_item_id', 'workflow_stage_id'], 'workflow_task_unique');
            $table->index(['order_id', 'status']);
            $table->index(['assigned_to_user_id', 'status']);
            $table->index(['assigned_to_worker_id', 'status']);
            $table->index(['due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_workflow_tasks');
    }
};
