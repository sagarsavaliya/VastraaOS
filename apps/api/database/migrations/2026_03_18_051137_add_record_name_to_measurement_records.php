<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('measurement_records', function (Blueprint $table) {
            $table->string('record_name', 50)->nullable()->after('measurement_profile_id');
        });
    }

    public function down(): void
    {
        Schema::table('measurement_records', function (Blueprint $table) {
            $table->dropColumn('record_name');
        });
    }
};
