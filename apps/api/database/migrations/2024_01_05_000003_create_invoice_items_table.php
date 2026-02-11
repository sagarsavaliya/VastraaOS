<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->nullable()->constrained()->onDelete('set null');

            // Item details
            $table->string('description', 255);
            $table->string('hsn_code', 20)->nullable(); // HSN/SAC code for GST
            $table->integer('quantity')->default(1);
            $table->string('unit', 20)->default('pcs'); // pcs, mtr, etc.
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('taxable_amount', 12, 2)->default(0);

            // GST rates and amounts
            $table->decimal('cgst_rate', 5, 2)->default(0);
            $table->decimal('cgst_amount', 10, 2)->default(0);
            $table->decimal('sgst_rate', 5, 2)->default(0);
            $table->decimal('sgst_amount', 10, 2)->default(0);
            $table->decimal('igst_rate', 5, 2)->default(0);
            $table->decimal('igst_amount', 10, 2)->default(0);

            // Total
            $table->decimal('total_amount', 12, 2)->default(0);

            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['invoice_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
