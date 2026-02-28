<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_cost_estimates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained()->onDelete('cascade');

            // Material costs
            $table->decimal('fabric_cost', 12, 2)->default(0);
            $table->decimal('lining_cost', 10, 2)->default(0);
            $table->decimal('interlining_cost', 10, 2)->default(0);
            $table->decimal('accessories_cost', 10, 2)->default(0); // Buttons, zippers, hooks

            // Work costs
            $table->decimal('embellishment_cost', 12, 2)->default(0);
            $table->decimal('stitching_cost', 10, 2)->default(0);
            $table->decimal('additional_work_cost', 10, 2)->default(0);

            // Labor
            $table->decimal('worker_cost', 12, 2)->default(0);
            $table->decimal('staff_expense', 10, 2)->default(0);

            // Other
            $table->decimal('packing_cost', 10, 2)->default(0);
            $table->decimal('transport_cost', 10, 2)->default(0);
            $table->decimal('miscellaneous_cost', 10, 2)->default(0);

            // Totals
            $table->decimal('total_cost', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->decimal('profit_amount', 12, 2)->default(0);
            $table->decimal('profit_percentage', 6, 2)->default(0);

            // Time estimates
            $table->integer('fabric_days')->default(0);
            $table->integer('embellishment_days')->default(0);
            $table->integer('stitching_days')->default(0);
            $table->integer('finishing_days')->default(0);
            $table->integer('total_days')->default(0);
            $table->date('calculated_delivery_date')->nullable();

            $table->text('notes')->nullable();
            $table->foreignId('estimated_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('estimated_at')->nullable();
            $table->timestamps();

            $table->unique(['order_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_cost_estimates');
    }
};
