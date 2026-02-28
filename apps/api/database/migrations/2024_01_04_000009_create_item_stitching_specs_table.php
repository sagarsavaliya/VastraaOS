<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_stitching_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained()->onDelete('cascade');

            // Blouse specific
            $table->string('blouse_style', 50)->nullable(); // Princess cut, Regular, Padded
            $table->string('sleeve_type', 50)->nullable(); // Full, Half, Sleeveless, Cap
            $table->string('sleeve_length', 50)->nullable(); // Inches or description
            $table->string('back_style', 50)->nullable(); // Deep back, Closed, Dori
            $table->string('neck_style_front', 50)->nullable();
            $table->string('neck_style_back', 50)->nullable();
            $table->string('neck_depth_front', 20)->nullable(); // Inches
            $table->string('neck_depth_back', 20)->nullable();

            // Bottom specific (Lehenga/Skirt)
            $table->string('bottom_style', 50)->nullable(); // Flared, A-line, Straight
            $table->string('waist_style', 50)->nullable(); // Elastic, Drawstring, Fitted
            $table->boolean('has_cancan')->default(false);
            $table->integer('cancan_layers')->nullable();
            $table->boolean('has_lining')->default(true);
            $table->string('lining_type', 50)->nullable();

            // General
            $table->string('closure_type', 50)->nullable(); // Zipper, Hook, Button
            $table->string('closure_position', 50)->nullable(); // Side, Back, Front
            $table->boolean('has_pockets')->default(false);
            $table->string('pocket_style', 50)->nullable();

            // Dupatta specific
            $table->decimal('dupatta_length', 6, 2)->nullable();
            $table->decimal('dupatta_width', 6, 2)->nullable();
            $table->string('dupatta_border_style', 50)->nullable();

            // Padding/Support
            $table->boolean('has_cups')->default(false);
            $table->string('cup_type', 30)->nullable(); // Attached, Removable, None
            $table->boolean('has_padding')->default(false);
            $table->string('padding_type', 30)->nullable();

            // Additional
            $table->text('additional_specifications')->nullable();
            $table->json('specification_images')->nullable();
            $table->decimal('stitching_cost', 10, 2)->default(0);
            $table->integer('estimated_days')->nullable();
            $table->timestamps();

            $table->index(['order_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_stitching_specs');
    }
};
