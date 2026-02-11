<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // We need to modify the enum column. 
        // Since Doctrine DBAL enum support can be tricky with custom values, 
        // we'll use a raw statement for MySQL which is the underlying DB here.
        
        DB::statement("ALTER TABLE `customer_inquiries` MODIFY COLUMN `status` ENUM('new', 'contacted', 'appointment_scheduled', 'appointment_completed', 'quote_sent', 'converted', 'lost', 'cancelled', 'follow_up', 'interested', 'not_interested', 'closed') DEFAULT 'new'");
    }

    public function down(): void
    {
        // Revert to original enum values (warning: this might fail if data exists with new values)
        // For safety in dev environment, we usually don't strictly revert data-loss migrations, 
        // but here is the schema revert.
        DB::statement("ALTER TABLE `customer_inquiries` MODIFY COLUMN `status` ENUM('new', 'contacted', 'appointment_scheduled', 'appointment_completed', 'quote_sent', 'converted', 'lost', 'cancelled') DEFAULT 'new'");
    }
};
