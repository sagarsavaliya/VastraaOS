<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Denormalized summary table for quick access to payment status
        Schema::create('order_payment_summary', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->onDelete('cascade');
            $table->decimal('total_order_amount', 12, 2)->default(0);
            $table->decimal('total_invoiced_amount', 12, 2)->default(0);
            $table->decimal('total_paid_amount', 12, 2)->default(0);
            $table->decimal('pending_amount', 12, 2)->default(0); // Ughrani
            $table->decimal('advance_amount', 12, 2)->default(0);
            $table->integer('total_invoices')->default(0);
            $table->integer('total_payments')->default(0);
            $table->date('last_payment_date')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_payment_summary');
    }
};
