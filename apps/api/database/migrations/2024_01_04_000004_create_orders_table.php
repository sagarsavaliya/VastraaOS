<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('order_number', 30);

            // Delivery address
            $table->string('delivery_address_line1', 255)->nullable();
            $table->string('delivery_address_line2', 255)->nullable();
            $table->string('delivery_city', 100)->nullable();
            $table->string('delivery_state', 100)->nullable();
            $table->string('delivery_pincode', 10)->nullable();
            $table->boolean('use_customer_address')->default(true);

            $table->foreignId('customer_id')->constrained()->onDelete('restrict');
            $table->foreignId('measurement_profile_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('inquiry_id')->nullable()->constrained('customer_inquiries')->onDelete('set null');

            // Order details
            $table->foreignId('occasion_id')->nullable()->constrained('occasions')->onDelete('set null');
            $table->foreignId('status_id')->constrained('order_statuses')->onDelete('restrict');
            $table->foreignId('priority_id')->nullable()->constrained('order_priorities')->onDelete('set null');

            // Dates
            $table->date('order_date');
            $table->date('event_date')->nullable();
            $table->date('promised_delivery_date')->nullable();
            $table->date('estimated_delivery_date')->nullable();
            $table->date('actual_delivery_date')->nullable();

            // Pricing summary
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->enum('discount_type', ['fixed', 'percentage'])->nullable();
            $table->decimal('discount_value', 10, 2)->default(0); // Percentage or fixed value
            $table->decimal('priority_surcharge', 10, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);

            // Payment summary (denormalized for quick access)
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('amount_pending', 12, 2)->default(0);
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])->default('pending');

            // Additional info
            $table->text('special_instructions')->nullable();
            $table->text('internal_notes')->nullable();
            $table->json('reference_images')->nullable();
            $table->json('tags')->nullable();

            // Workflow
            $table->foreignId('current_workflow_stage_id')->nullable()->constrained('workflow_stages')->onDelete('set null');
            $table->integer('workflow_completion_percentage')->default(0);

            // Timestamps
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            // Tracking
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'order_number']);
            $table->index(['tenant_id', 'customer_id']);
            $table->index(['tenant_id', 'status_id']);
            $table->index(['tenant_id', 'order_date']);
            $table->index(['tenant_id', 'promised_delivery_date']);
            $table->index(['tenant_id', 'payment_status']);
        });

        // Add foreign key for converted_to_order_id in customer_inquiries
        Schema::table('customer_inquiries', function (Blueprint $table) {
            $table->foreign('converted_to_order_id')
                  ->references('id')
                  ->on('orders')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('customer_inquiries', function (Blueprint $table) {
            $table->dropForeign(['converted_to_order_id']);
        });

        Schema::dropIfExists('orders');
    }
};
