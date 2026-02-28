<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('customer_code', 20)->nullable(); // Auto-generated: CUST-0001
            $table->string('first_name', 50);
            $table->string('last_name', 50)->nullable();
            $table->string('display_name', 100)->nullable(); // Full name or nickname
            $table->string('email', 100)->nullable();
            $table->string('mobile', 15);
            $table->string('alternate_mobile', 15)->nullable();
            $table->string('whatsapp_number', 15)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->date('anniversary_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('pincode', 10)->nullable();
            $table->string('gst_number', 15)->nullable(); // For B2B customers
            $table->text('notes')->nullable();
            $table->string('profile_photo_url', 255)->nullable();
            $table->enum('customer_type', ['individual', 'business'])->default('individual');
            $table->string('company_name', 100)->nullable();
            $table->string('designation', 100)->nullable();
            $table->text('company_address')->nullable();
            $table->string('company_city', 100)->nullable();
            $table->string('company_state', 100)->nullable();
            $table->string('company_pincode', 10)->nullable();
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active');
            $table->json('preferences')->nullable(); // Communication preferences, etc.
            $table->json('tags')->nullable(); // For categorization
            $table->foreignId('referred_by_customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'customer_code']);
            $table->index(['tenant_id', 'mobile']);
            $table->index(['tenant_id', 'email']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'first_name', 'last_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
