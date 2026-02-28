<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('business_name', 255);
            $table->string('display_name', 100);
            $table->string('subdomain', 50)->unique();
            $table->string('custom_domain', 255)->nullable()->unique();
            $table->string('email', 100)->unique();
            $table->string('mobile', 15);
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('state_code', 2)->nullable();
            $table->string('pincode', 10)->nullable();
            $table->string('logo_url', 255)->nullable();
            $table->string('favicon_url', 255)->nullable();
            $table->enum('status', ['active', 'suspended', 'cancelled', 'trial'])->default('trial');
            $table->string('verification_token', 100)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->tinyInteger('onboarding_step')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
