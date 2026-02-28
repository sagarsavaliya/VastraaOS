<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_additional_works', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained()->onDelete('cascade');
            $table->string('work_name', 100);
            $table->text('description')->nullable();
            $table->decimal('cost', 10, 2)->default(0);
            $table->integer('estimated_days')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->foreignId('assigned_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['order_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_additional_works');
    }
};
