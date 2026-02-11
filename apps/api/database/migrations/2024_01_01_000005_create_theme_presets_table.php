<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theme_presets', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('slug', 50)->unique();
            $table->boolean('is_dark')->default(false);
            $table->json('colors');
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index('is_system');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_presets');
    }
};
