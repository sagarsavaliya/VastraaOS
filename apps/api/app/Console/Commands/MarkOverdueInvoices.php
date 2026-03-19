<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MarkOverdueInvoices extends Command
{
    protected $signature   = 'billing:mark-overdue';
    protected $description = 'Bulk-mark issued invoices as overdue when their due_date has passed';

    public function handle(): int
    {
        try {
            $updated = DB::table('invoices')
                ->where('status', 'issued')
                ->whereNotIn('payment_status', ['paid', 'cancelled', 'overdue'])
                ->whereNotNull('due_date')
                ->whereRaw('due_date < CURDATE()')
                ->whereNull('deleted_at')
                ->update(['payment_status' => 'overdue']);

            $this->info("Marked {$updated} invoice(s) as overdue.");
            Log::info("billing:mark-overdue — marked {$updated} invoices as overdue.");
        } catch (\Throwable $e) {
            Log::error('billing:mark-overdue failed', ['error' => $e->getMessage()]);
            $this->error('Failed to mark overdue invoices: ' . $e->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
