<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->timestamp('voided_at')->nullable()->after('refund_reason');
            $table->foreignId('voided_by_user_id')->nullable()->constrained('users')->onDelete('set null')->after('voided_at');
            $table->text('void_reason')->nullable()->after('voided_by_user_id');
            $table->boolean('advance_payment')->default(false)->after('void_reason');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['voided_by_user_id']);
            $table->dropColumn(['voided_at', 'voided_by_user_id', 'void_reason', 'advance_payment']);
        });
    }
};
