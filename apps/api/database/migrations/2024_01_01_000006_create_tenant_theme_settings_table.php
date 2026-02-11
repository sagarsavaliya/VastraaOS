<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_theme_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('theme_preset_id')->nullable()->constrained('theme_presets')->onDelete('set null');
            $table->json('custom_colors')->nullable();
            $table->string('logo_url', 255)->nullable();
            $table->string('favicon_url', 255)->nullable();
            $table->enum('sidebar_style', ['default', 'compact', 'minimal'])->default('default');
            $table->enum('sidebar_position', ['left', 'right'])->default('left');
            $table->enum('navbar_style', ['default', 'transparent', 'colored'])->default('default');
            $table->boolean('enable_dark_mode')->default(true);
            $table->enum('default_mode', ['light', 'dark', 'system'])->default('light');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_theme_settings');
    }
};
