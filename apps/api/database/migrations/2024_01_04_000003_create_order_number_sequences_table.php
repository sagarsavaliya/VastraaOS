<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_number_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('sequence_type', 50); // 'order', 'invoice_gst', 'invoice_non_gst', 'inquiry', 'customer', 'worker'
            $table->string('prefix', 20)->default(''); // ORD-, INV-, INQ-
            $table->string('suffix', 20)->default('');
            $table->integer('current_number')->default(0);
            $table->integer('padding_length')->default(4); // For formatting: 0001
            $table->string('fiscal_year', 10)->nullable(); // 2024-25
            $table->boolean('reset_yearly')->default(true);
            $table->date('last_reset_date')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'sequence_type', 'fiscal_year'], 'order_num_seq_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_number_sequences');
    }
};
