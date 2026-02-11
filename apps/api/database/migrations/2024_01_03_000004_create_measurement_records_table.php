<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('measurement_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('measurement_profile_id')->constrained()->onDelete('cascade');
            $table->date('recorded_date');
            $table->text('notes')->nullable();
            $table->boolean('is_latest')->default(true); // Latest record for this profile
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['tenant_id', 'measurement_profile_id']);
            $table->index(['measurement_profile_id', 'is_latest']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('measurement_records');
    }
};
