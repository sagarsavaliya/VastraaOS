<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_ranges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('name', 100); // e.g., "Budget", "Standard", "Premium", "Luxury"
            $table->string('name_gujarati', 100)->nullable();
            $table->string('name_hindi', 100)->nullable();
            $table->decimal('min_amount', 12, 2);
            $table->decimal('max_amount', 12, 2)->nullable(); // null for "unlimited"
            $table->string('currency', 3)->default('INR');
            $table->text('description')->nullable();
            $table->string('color', 20)->nullable(); // For UI color coding
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'name']);
            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_ranges');
    }
};
