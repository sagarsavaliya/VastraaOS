<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('worker_code', 20)->nullable(); // WRK-0001
            $table->string('first_name', 50);
            $table->string('last_name', 50)->nullable();
            $table->string('display_name', 100)->nullable();
            $table->string('mobile', 15);
            $table->string('alternate_mobile', 15)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('pincode', 10)->nullable();

            // Payment info
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_number', 30)->nullable();
            $table->string('bank_ifsc_code', 15)->nullable();
            $table->string('upi_id', 100)->nullable();
            $table->string('pan_number', 10)->nullable();

            // Work details
            $table->enum('worker_type', ['internal', 'external'])->default('external');
            $table->decimal('default_rate', 10, 2)->nullable(); // Default per-piece rate
            $table->enum('rate_type', ['per_piece', 'hourly', 'daily', 'monthly'])->default('per_piece');

            $table->text('notes')->nullable();
            $table->string('profile_photo_url', 255)->nullable();
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active');
            $table->boolean('is_active')->default(true);
            $table->date('joined_date')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'worker_code']);
            $table->index(['tenant_id', 'mobile']);
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
