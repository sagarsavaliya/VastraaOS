<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('measurement_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('name', 100); // e.g., "Bust", "Waist", "Hip", "Shoulder"
            $table->string('name_gujarati', 100)->nullable();
            $table->string('name_hindi', 100)->nullable();
            $table->string('code', 20); // Short code: "BUST", "WAIST", "HIP"
            $table->enum('body_section', ['upper', 'lower', 'full'])->default('full');
            $table->string('unit', 10)->default('inches'); // inches, cm
            $table->decimal('min_value', 6, 2)->nullable(); // Validation min
            $table->decimal('max_value', 6, 2)->nullable(); // Validation max
            $table->text('description')->nullable();
            $table->text('measurement_guide')->nullable(); // How to measure
            $table->string('guide_image_url', 255)->nullable(); // Visual guide
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
            $table->index(['tenant_id', 'is_active']);
            $table->index(['tenant_id', 'body_section']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('measurement_types');
    }
};
