<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_fabrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->onDelete('cascade');
            $table->string('fabric_name', 100);
            $table->string('fabric_type', 50)->nullable(); // Silk, Cotton, Chiffon, etc.
            $table->string('fabric_color', 50)->nullable();
            $table->string('fabric_pattern', 50)->nullable(); // Plain, Printed, Embroidered
            $table->decimal('quantity_meters', 8, 2)->nullable();
            $table->decimal('cost_per_meter', 10, 2)->nullable();
            $table->decimal('total_cost', 12, 2)->nullable();
            $table->enum('sourcing_type', ['customer_provided', 'shop_provided', 'to_be_sourced'])->default('shop_provided');
            $table->enum('sourcing_status', ['pending', 'sourced', 'received'])->default('pending');
            $table->string('supplier_name', 100)->nullable();
            $table->text('supplier_details')->nullable();
            $table->json('fabric_images')->nullable();
            $table->text('notes')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['order_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_fabrics');
    }
};
