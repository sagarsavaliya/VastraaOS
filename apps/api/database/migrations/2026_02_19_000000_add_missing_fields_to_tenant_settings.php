<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('tenant_settings', 'pan_number')) {
                $table->string('pan_number', 10)->nullable()->after('gst_registered_name');
            }
            if (!Schema::hasColumn('tenant_settings', 'terms_and_conditions')) {
                $table->text('terms_and_conditions')->nullable()->after('measurement_unit');
            }
            if (!Schema::hasColumn('tenant_settings', 'invoice_notes')) {
                $table->text('invoice_notes')->nullable()->after('terms_and_conditions');
            }
            if (!Schema::hasColumn('tenant_settings', 'date_format')) {
                $table->string('date_format', 20)->default('DD/MM/YYYY')->after('timezone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tenant_settings', function (Blueprint $table) {
            $table->dropColumn(['pan_number', 'terms_and_conditions', 'invoice_notes', 'date_format']);
        });
    }
};
