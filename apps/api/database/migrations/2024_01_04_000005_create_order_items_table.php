<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('item_type_id')->constrained()->onDelete('restrict');
            $table->string('item_name', 100)->nullable(); // Custom name override
            $table->text('description')->nullable();
            $table->integer('quantity')->default(1);

            // Pricing
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);

            // GST details
            $table->string('hsn_code', 20)->nullable();
            $table->decimal('cgst_rate', 5, 2)->default(0);
            $table->decimal('sgst_rate', 5, 2)->default(0);
            $table->decimal('igst_rate', 5, 2)->default(0);

            // Size/Fit
            $table->string('size', 20)->nullable(); // XS, S, M, L, XL, XXL or custom
            $table->enum('fit_type', ['slim', 'regular', 'relaxed', 'custom'])->default('regular');

            // Status
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->foreignId('current_workflow_stage_id')->nullable()->constrained('workflow_stages')->onDelete('set null');

            // Assignment
            $table->foreignId('assigned_worker_id')->nullable()->constrained('workers')->onDelete('set null');
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('worker_payment_amount', 10, 2)->default(0);
            $table->enum('worker_payment_status', ['pending', 'paid'])->default('pending');

            // Dates
            $table->date('estimated_completion_date')->nullable();
            $table->date('actual_completion_date')->nullable();

            // Notes
            $table->text('special_instructions')->nullable();
            $table->json('reference_images')->nullable();

            $table->integer('display_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
