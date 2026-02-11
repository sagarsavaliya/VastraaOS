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
        Schema::table('order_workflow_tasks', function (Blueprint $table) {
            $table->foreignId('tenant_id')->after('id')->nullable()->constrained()->onDelete('cascade');
            $table->index('tenant_id');
        });

        // Backfill tenant_id from orders
        DB::table('order_workflow_tasks')
            ->join('orders', 'order_workflow_tasks.order_id', '=', 'orders.id')
            ->update(['order_workflow_tasks.tenant_id' => DB::raw('orders.tenant_id')]);

        // Make tenant_id non-nullable after backfill
        Schema::table('order_workflow_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_workflow_tasks', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
        });
    }
};
