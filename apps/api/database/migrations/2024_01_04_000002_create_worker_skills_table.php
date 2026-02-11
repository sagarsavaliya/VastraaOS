<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worker_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained()->onDelete('cascade');
            $table->foreignId('work_type_id')->constrained()->onDelete('cascade');
            $table->enum('proficiency_level', ['beginner', 'intermediate', 'expert'])->default('intermediate');
            $table->decimal('rate_per_piece', 10, 2)->nullable(); // Override worker's default rate
            $table->decimal('rate_per_hour', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['worker_id', 'work_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worker_skills');
    }
};
