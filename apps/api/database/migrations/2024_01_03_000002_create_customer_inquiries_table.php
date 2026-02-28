<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('inquiry_number', 20)->nullable(); // INQ-2024-0001
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');

            // If customer not yet created, capture basic info
            $table->string('customer_name', 100)->nullable();
            $table->string('customer_mobile', 15)->nullable();
            $table->string('customer_email', 100)->nullable();
            $table->string('customer_type', 20)->default('individual');

            // Company info
            $table->string('company_name', 100)->nullable();
            $table->string('designation', 100)->nullable();
            $table->text('company_address')->nullable();
            $table->string('company_city', 100)->nullable();
            $table->string('company_state', 100)->nullable();
            $table->string('company_pincode', 10)->nullable();
            $table->string('company_gst', 15)->nullable();

            // Personal address
            $table->string('address', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('pincode', 10)->nullable();

            // Inquiry details
            $table->foreignId('source_id')->nullable()->constrained('inquiry_sources')->onDelete('set null');
            $table->foreignId('occasion_id')->nullable()->constrained('occasions')->onDelete('set null');
            $table->foreignId('budget_range_id')->nullable()->constrained('budget_ranges')->onDelete('set null');
            $table->foreignId('item_type_id')->nullable()->constrained('item_types')->onDelete('set null');

            $table->text('requirements')->nullable();
            $table->date('event_date')->nullable();
            $table->date('preferred_delivery_date')->nullable();
            $table->datetime('appointment_datetime')->nullable();

            $table->enum('status', [
                'new',
                'contacted',
                'appointment_scheduled',
                'appointment_completed',
                'quote_sent',
                'converted',
                'lost',
                'cancelled',
                'follow_up',
                'interested',
                'not_interested',
                'closed',
            ])->default('new');

            $table->text('notes')->nullable();
            $table->json('reference_images')->nullable(); // URLs to uploaded reference images

            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('converted_to_order_id')->nullable(); // Will be set after order creation
            $table->timestamp('converted_at')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'inquiry_number']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'customer_id']);
            $table->index(['tenant_id', 'created_at']);
            $table->index(['tenant_id', 'appointment_datetime']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_inquiries');
    }
};
