<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_groups', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->unsignedBigInteger('expense_group_id')->nullable()->after('category_id');
            $table->unsignedBigInteger('employee_user_id')->nullable()->after('expense_group_id');
            $table->foreign('expense_group_id')->references('id')->on('expense_groups');
            $table->foreign('employee_user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['expense_group_id']);
            $table->dropForeign(['employee_user_id']);
            $table->dropColumn(['expense_group_id', 'employee_user_id']);
        });
        Schema::dropIfExists('expense_groups');
    }
};
