<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hsn_codes', function (Blueprint $table) {
            $table->id();
            // Nullable tenant_id: NULL = system-wide default, set = tenant override
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('hsn_code', 8);
            $table->string('description', 255);
            $table->decimal('gst_rate', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'hsn_code']);
            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hsn_codes');
    }
};
