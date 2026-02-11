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
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'customer_type')) {
                $table->string('customer_type', 20)->default('individual')->after('id');
            }
            if (!Schema::hasColumn('customers', 'company_city')) {
                $table->string('company_city', 100)->nullable()->after('company_address');
            }
            if (!Schema::hasColumn('customers', 'company_state')) {
                $table->string('company_state', 100)->nullable()->after('company_city');
            }
            if (!Schema::hasColumn('customers', 'company_pincode')) {
                $table->string('company_pincode', 10)->nullable()->after('company_state');
            }
        });

        Schema::table('customer_inquiries', function (Blueprint $table) {
            if (!Schema::hasColumn('customer_inquiries', 'customer_type')) {
                $table->string('customer_type', 20)->default('individual')->after('customer_id');
            }
            if (!Schema::hasColumn('customer_inquiries', 'company_city')) {
                $table->string('company_city', 100)->nullable()->after('company_address');
            }
            if (!Schema::hasColumn('customer_inquiries', 'company_state')) {
                $table->string('company_state', 100)->nullable()->after('company_city');
            }
            if (!Schema::hasColumn('customer_inquiries', 'company_pincode')) {
                $table->string('company_pincode', 10)->nullable()->after('company_state');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['customer_type', 'company_city', 'company_state', 'company_pincode']);
        });

        Schema::table('customer_inquiries', function (Blueprint $table) {
             $table->dropColumn(['customer_type', 'company_city', 'company_state', 'company_pincode']);
        });
    }
};
