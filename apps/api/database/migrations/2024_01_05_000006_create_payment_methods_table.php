<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // For tenant subscription payments (not order payments)
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['card', 'upi', 'netbanking', 'wallet'])->default('card');
            $table->string('provider', 50)->nullable(); // razorpay, stripe
            $table->string('provider_payment_method_id', 100)->nullable();

            // Card details (masked)
            $table->string('card_last_four', 4)->nullable();
            $table->string('card_brand', 20)->nullable(); // visa, mastercard
            $table->string('card_exp_month', 2)->nullable();
            $table->string('card_exp_year', 4)->nullable();

            // UPI details
            $table->string('upi_id', 100)->nullable();

            // Bank details
            $table->string('bank_name', 100)->nullable();

            $table->boolean('is_default')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->index(['tenant_id', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
