<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_task_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_task_id')->constrained('order_workflow_tasks')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->text('comment');
            $table->json('attachments')->nullable();
            $table->boolean('is_internal')->default(true); // Internal vs customer-visible
            $table->timestamps();
            $table->softDeletes();

            $table->index(['workflow_task_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_task_comments');
    }
};
