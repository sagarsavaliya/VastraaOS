<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_embellishment_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('item_embellishment_id')->constrained()->onDelete('cascade');
            $table->foreignId('embellishment_zone_id')->constrained()->onDelete('cascade');
            $table->text('description')->nullable();
            $table->decimal('additional_cost', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['item_embellishment_id', 'embellishment_zone_id'], 'embellishment_zone_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_embellishment_zones');
    }
};
