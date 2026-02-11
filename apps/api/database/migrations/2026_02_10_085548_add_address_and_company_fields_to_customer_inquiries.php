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
        Schema::table('customer_inquiries', function (Blueprint $table) {
            $table->string('company_name', 100)->nullable()->after('customer_email');
            $table->string('designation', 100)->nullable()->after('company_name');
            $table->text('company_address')->nullable()->after('designation');
            $table->string('company_gst', 15)->nullable()->after('company_address');
            $table->string('address', 255)->nullable()->after('company_gst');
            $table->string('city', 100)->nullable()->after('address');
            $table->string('state', 100)->nullable()->after('city');
            $table->string('pincode', 10)->nullable()->after('state');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_inquiries', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'designation',
                'company_address',
                'company_gst',
                'address',
                'city',
                'state',
                'pincode'
            ]);
        });
    }
};
