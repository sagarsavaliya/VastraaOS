<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_embellishments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('work_type_id')->constrained()->onDelete('restrict');
            $table->text('description')->nullable();
            $table->enum('complexity', ['simple', 'moderate', 'complex', 'intricate'])->default('moderate');
            $table->decimal('estimated_hours', 6, 2)->nullable();
            $table->decimal('cost', 12, 2)->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->foreignId('assigned_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->decimal('worker_rate', 10, 2)->nullable();
            $table->json('design_images')->nullable();
            $table->text('notes')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['order_item_id']);
            $table->index(['assigned_worker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_embellishments');
    }
};
