<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_number_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->enum('invoice_type', ['gst', 'non_gst']); // Separate sequence per type
            $table->string('prefix', 20)->default(''); // INV-, GST-, etc.
            $table->string('suffix', 20)->default('');
            $table->integer('current_number')->default(0);
            $table->integer('padding_length')->default(4);
            $table->string('fiscal_year', 10)->nullable(); // 2024-25
            $table->boolean('reset_yearly')->default(true);
            $table->date('last_reset_date')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'invoice_type', 'fiscal_year'], 'inv_num_seq_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_number_sequences');
    }
};
