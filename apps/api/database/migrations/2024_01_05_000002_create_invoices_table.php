<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('invoice_number', 50);
            $table->foreignId('order_id')->constrained()->onDelete('restrict');
            $table->foreignId('customer_id')->constrained()->onDelete('restrict');

            // Invoice type
            $table->enum('invoice_type', ['gst', 'non_gst'])->default('non_gst');
            $table->boolean('is_split_invoice')->default(false); // Part of split invoicing

            // Dates
            $table->date('invoice_date');
            $table->date('due_date')->nullable();

            // Customer billing info (snapshot at invoice time)
            $table->string('billing_name', 100);
            $table->text('billing_address')->nullable();
            $table->string('billing_city', 100)->nullable();
            $table->string('billing_state', 100)->nullable();
            $table->string('billing_state_code', 2)->nullable();
            $table->string('billing_pincode', 10)->nullable();
            $table->string('billing_gst_number', 15)->nullable();

            // Seller info (snapshot at invoice time)
            $table->string('seller_name', 100);
            $table->text('seller_address')->nullable();
            $table->string('seller_city', 100)->nullable();
            $table->string('seller_state', 100)->nullable();
            $table->string('seller_state_code', 2)->nullable();
            $table->string('seller_pincode', 10)->nullable();
            $table->string('seller_gst_number', 15)->nullable();
            $table->string('seller_pan_number', 10)->nullable();

            // Amounts
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('taxable_amount', 12, 2)->default(0);

            // GST breakdown
            $table->decimal('cgst_amount', 12, 2)->default(0);
            $table->decimal('sgst_amount', 12, 2)->default(0);
            $table->decimal('igst_amount', 12, 2)->default(0);
            $table->decimal('total_tax_amount', 12, 2)->default(0);

            // Final amounts
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('round_off_amount', 8, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->string('amount_in_words', 255)->nullable();

            // Payment status
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('amount_pending', 12, 2)->default(0);
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'overdue', 'cancelled'])->default('unpaid');

            // E-way bill (for GST invoices)
            $table->string('eway_bill_number', 50)->nullable();
            $table->date('eway_bill_date')->nullable();

            // Status
            $table->enum('status', ['draft', 'issued', 'cancelled', 'refunded'])->default('draft');
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            // Additional
            $table->text('notes')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->string('pdf_url', 255)->nullable();

            // Tracking
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'invoice_number']);
            $table->index(['tenant_id', 'order_id']);
            $table->index(['tenant_id', 'customer_id']);
            $table->index(['tenant_id', 'invoice_date']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
