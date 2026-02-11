<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('payment_number', 30)->nullable(); // PAY-2024-0001
            $table->foreignId('order_id')->constrained()->onDelete('restrict');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('customer_id')->constrained()->onDelete('restrict');

            // Payment details
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->enum('payment_mode', [
                'cash',
                'upi',
                'card',
                'net_banking',
                'cheque',
                'bank_transfer',
                'wallet',
                'other'
            ])->default('cash');

            // Mode-specific references
            $table->string('transaction_reference', 100)->nullable(); // UPI ref, card approval, etc.
            $table->string('cheque_number', 20)->nullable();
            $table->date('cheque_date')->nullable();
            $table->string('bank_name', 100)->nullable();

            // Status
            $table->enum('status', [
                'pending',
                'completed',
                'failed',
                'refunded',
                'cancelled'
            ])->default('completed');

            // Refund details
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->date('refund_date')->nullable();
            $table->text('refund_reason')->nullable();

            // Additional
            $table->text('notes')->nullable();
            $table->json('receipt_attachment')->nullable();

            // Tracking
            $table->foreignId('received_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'payment_number']);
            $table->index(['tenant_id', 'order_id']);
            $table->index(['tenant_id', 'invoice_id']);
            $table->index(['tenant_id', 'customer_id']);
            $table->index(['tenant_id', 'payment_date']);
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
