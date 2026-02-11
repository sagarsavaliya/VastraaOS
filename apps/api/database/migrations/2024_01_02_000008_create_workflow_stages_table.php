<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('name', 100);
            $table->string('name_gujarati', 100)->nullable();
            $table->string('name_hindi', 100)->nullable();
            $table->string('code', 30); // SHORT_CODE for stage
            $table->text('description')->nullable();
            $table->string('color', 20)->default('#6366f1'); // For Kanban column
            $table->string('icon', 50)->nullable();
            $table->integer('stage_order'); // 1-21 (sequence in workflow)
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('is_skippable')->default(false);
            $table->boolean('requires_photo')->default(false);
            $table->boolean('requires_approval')->default(false);
            $table->boolean('notify_customer')->default(false); // Send notification
            $table->integer('estimated_days')->default(1); // For delivery estimation
            $table->enum('assigned_role', ['owner', 'manager', 'staff', 'worker', 'any'])->default('any');
            $table->json('allowed_transitions')->nullable(); // Which stages can come next
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
            $table->unique(['tenant_id', 'stage_order']);
            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_stages');
    }
};
