<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('name', 50); // Draft, Confirmed, In Progress, Completed, Delivered, Cancelled
            $table->string('name_gujarati', 50)->nullable();
            $table->string('name_hindi', 50)->nullable();
            $table->string('code', 20); // DRAFT, CONFIRMED, IN_PROGRESS, etc.
            $table->text('description')->nullable();
            $table->string('color', 20)->default('#6366f1');
            $table->string('icon', 50)->nullable();
            $table->boolean('is_default')->default(false); // Default status for new orders
            $table->boolean('is_final')->default(false); // No further transitions allowed
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->json('allowed_transitions')->nullable(); // Which statuses can come next
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_statuses');
    }
};
