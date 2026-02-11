<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_priorities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('name', 50); // Normal, Urgent, Rush, VIP
            $table->string('name_gujarati', 50)->nullable();
            $table->string('name_hindi', 50)->nullable();
            $table->string('code', 20); // NORMAL, URGENT, RUSH, VIP
            $table->text('description')->nullable();
            $table->string('color', 20)->default('#6366f1');
            $table->string('icon', 50)->nullable();
            $table->decimal('surcharge_percentage', 5, 2)->default(0); // % extra charge
            $table->decimal('surcharge_flat', 10, 2)->default(0); // Flat extra charge
            $table->integer('priority_level')->default(0); // Higher = more urgent
            $table->integer('days_reduction')->default(0); // Days to reduce from estimate
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_priorities');
    }
};
