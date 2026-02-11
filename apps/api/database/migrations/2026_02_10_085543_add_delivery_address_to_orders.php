<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_address_line1', 255)->nullable()->after('order_number');
            $table->string('delivery_address_line2', 255)->nullable()->after('delivery_address_line1');
            $table->string('delivery_city', 100)->nullable()->after('delivery_address_line2');
            $table->string('delivery_state', 100)->nullable()->after('delivery_city');
            $table->string('delivery_pincode', 10)->nullable()->after('delivery_state');
            $table->boolean('use_customer_address')->default(true)->after('delivery_pincode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_address_line1',
                'delivery_address_line2',
                'delivery_city',
                'delivery_state',
                'delivery_pincode',
                'use_customer_address'
            ]);
        });
    }
};
