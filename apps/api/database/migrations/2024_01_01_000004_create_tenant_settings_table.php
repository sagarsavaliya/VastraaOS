<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->onDelete('cascade');

            // GST Settings
            $table->boolean('gst_module_enabled')->default(false);
            $table->string('gst_number', 15)->nullable();
            $table->string('gst_registered_name', 255)->nullable();
            $table->string('pan_number', 10)->nullable();
            $table->decimal('hidden_gst_percentage', 5, 2)->default(0);

            // Invoice Settings
            $table->string('gst_invoice_prefix', 10)->default('GST');
            $table->string('non_gst_invoice_prefix', 10)->default('INV');
            $table->string('order_prefix', 10)->default('ORD');
            $table->tinyInteger('financial_year_start')->default(4); // April

            // Other Settings
            $table->boolean('enable_itc_tracking')->default(false);
            $table->string('currency', 3)->default('INR');
            $table->string('timezone', 50)->default('Asia/Kolkata');
            $table->string('date_format', 20)->default('DD/MM/YYYY');
            $table->enum('measurement_unit', ['inches', 'cm'])->default('inches');
            $table->text('terms_and_conditions')->nullable();
            $table->text('invoice_notes')->nullable();
            $table->boolean('two_factor_enabled')->default(false);

            $table->timestamps();

            $table->index('gst_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_settings');
    }
};
