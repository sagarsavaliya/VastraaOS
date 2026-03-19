<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendPaymentDueReminders extends Command
{
    protected $signature   = 'billing:send-payment-reminders';
    protected $description = 'Log payment due reminders for invoices at key due-date thresholds';

    /**
     * Reminder thresholds: reminder_type => days offset from due_date.
     * Positive = due_date is X days in the future (upcoming).
     * Negative = due_date was X days ago (overdue).
     */
    private const THRESHOLDS = [
        'upcoming_3days' =>  3,
        'due_today'      =>  0,
        'overdue_3days'  => -3,
        'overdue_7days'  => -7,
    ];

    public function handle(): int
    {
        $today = now()->toDateString();

        foreach (self::THRESHOLDS as $reminderType => $daysOffset) {
            $targetDate = now()->addDays($daysOffset)->toDateString();

            $this->processReminders($reminderType, $targetDate, $today);
        }

        return self::SUCCESS;
    }

    private function processReminders(string $reminderType, string $targetDueDate, string $today): void
    {
        // Find invoices whose due_date matches the target date and are not paid/cancelled
        $invoices = DB::table('invoices')
            ->where('status', 'issued')
            ->whereNotIn('payment_status', ['paid', 'cancelled'])
            ->whereDate('due_date', $targetDueDate)
            ->whereNull('deleted_at')
            ->select('id', 'tenant_id', 'invoice_number', 'billing_name', 'due_date')
            ->get();

        foreach ($invoices as $invoice) {
            // Check if this reminder has already been logged to prevent duplicates
            $alreadySent = DB::table('payment_reminders_log')
                ->where('invoice_id', $invoice->id)
                ->where('reminder_type', $reminderType)
                ->where('reminder_date', $today)
                ->exists();

            if ($alreadySent) {
                continue;
            }

            try {
                // TODO: Dispatch actual WhatsApp/SMS/email notification here
                // e.g. SendPaymentReminderNotification::dispatch($invoice, $reminderType);

                DB::table('payment_reminders_log')->insert([
                    'tenant_id'     => $invoice->tenant_id,
                    'invoice_id'    => $invoice->id,
                    'reminder_type' => $reminderType,
                    'channel'       => 'whatsapp',
                    'reminder_date' => $today,
                    'sent'          => false, // false until actual dispatch is implemented
                    'sent_at'       => null,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);

                $this->line("Logged {$reminderType} reminder for invoice #{$invoice->invoice_number}");
                Log::info("Payment reminder logged", [
                    'invoice_id'    => $invoice->id,
                    'reminder_type' => $reminderType,
                    'due_date'      => $targetDueDate,
                ]);
            } catch (\Throwable $e) {
                Log::error('Failed to log payment reminder', [
                    'invoice_id'    => $invoice->id,
                    'reminder_type' => $reminderType,
                    'error'         => $e->getMessage(),
                ]);
            }
        }
    }
}
