<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_reminders_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->enum('reminder_type', ['upcoming_3days', 'due_today', 'overdue_3days', 'overdue_7days']);
            $table->enum('channel', ['whatsapp', 'sms', 'email'])->default('whatsapp');
            $table->date('reminder_date'); // The date this reminder was sent for
            $table->boolean('sent')->default(false);
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'invoice_id']);
            $table->index(['invoice_id', 'reminder_type', 'reminder_date'], 'prl_invoice_type_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_reminders_log');
    }
};
