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
        $tables = [
            'order_items',
            'item_fabrics',
            'item_embellishments',
            'item_stitching_specs',
            'item_additional_works',
            'item_cost_estimates',
            'item_embellishment_zones'
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                if (!Schema::hasColumn($table->getTable(), 'tenant_id')) {
                    $table->foreignId('tenant_id')->after('id')->nullable()->constrained()->onDelete('cascade');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'order_items',
            'item_fabrics',
            'item_embellishments',
            'item_stitching_specs',
            'item_additional_works',
            'item_cost_estimates',
            'item_embellishment_zones'
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                if (Schema::hasColumn($table->getTable(), 'tenant_id')) {
                    $table->dropForeign([$table->getTable() . '_tenant_id_foreign']);
                    $table->dropColumn('tenant_id');
                }
            });
        }
    }
};
