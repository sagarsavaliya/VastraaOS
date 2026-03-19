<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Add place_of_supply and is_inter_state (used in InvoiceResource but missing from DB)
            $table->string('place_of_supply', 100)->nullable()->after('seller_pan_number');
            $table->boolean('is_inter_state')->default(false)->after('place_of_supply');

            // Add sent_at and paid_at timestamps (used in InvoiceResource but missing from DB)
            $table->timestamp('sent_at')->nullable()->after('issued_at');
            $table->timestamp('paid_at')->nullable()->after('sent_at');

            // Rename billing_gst_number -> billing_gstin for consistency with InvoiceResource
            // The resource references billing_gstin, but the migration created billing_gst_number
            $table->renameColumn('billing_gst_number', 'billing_gstin');

            // Rename seller_gst_number -> seller_gstin for symmetry
            $table->renameColumn('seller_gst_number', 'seller_gstin');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->renameColumn('seller_gstin', 'seller_gst_number');
            $table->renameColumn('billing_gstin', 'billing_gst_number');
            $table->dropColumn(['sent_at', 'paid_at', 'is_inter_state', 'place_of_supply']);
        });
    }
};
