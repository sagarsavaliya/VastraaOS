<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('measurement_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('measurement_record_id')->constrained()->onDelete('cascade');
            $table->foreignId('measurement_type_id')->constrained()->onDelete('cascade');
            $table->decimal('value', 8, 2);
            $table->string('unit', 10)->default('inches');
            $table->text('notes')->nullable(); // e.g., "Prefer loose fitting"
            $table->timestamps();

            $table->unique(['measurement_record_id', 'measurement_type_id'], 'meas_val_record_type_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('measurement_values');
    }
};
