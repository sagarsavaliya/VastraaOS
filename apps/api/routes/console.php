<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Commands
|--------------------------------------------------------------------------
*/

// Mark overdue invoices daily at 00:30
Schedule::command('billing:mark-overdue')->dailyAt('00:30');

// Send payment due reminders daily at 09:00
Schedule::command('billing:send-payment-reminders')->dailyAt('09:00');
