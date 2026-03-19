<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_payment_summary', function (Blueprint $table) {
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'overdue'])
                ->default('unpaid')
                ->after('last_payment_date');
        });
    }

    public function down(): void
    {
        Schema::table('order_payment_summary', function (Blueprint $table) {
            $table->dropColumn('payment_status');
        });
    }
};
