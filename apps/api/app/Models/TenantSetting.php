<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'gst_enabled',
        'gst_number',
        'pan_number',
        'default_currency',
        'timezone',
        'date_format',
        'fiscal_year_start_month',
        'invoice_prefix_gst',
        'invoice_prefix_non_gst',
        'order_prefix',
        'customer_prefix',
        'default_payment_terms',
        'terms_and_conditions',
        'invoice_notes',
        'sms_enabled',
        'sms_provider',
        'sms_api_key',
        'whatsapp_enabled',
        'whatsapp_api_key',
        'email_enabled',
        'email_from_name',
        'email_from_address',
    ];

    protected $casts = [
        'gst_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'whatsapp_enabled' => 'boolean',
        'email_enabled' => 'boolean',
        'fiscal_year_start_month' => 'integer',
        'default_payment_terms' => 'integer',
    ];

    protected $hidden = [
        'sms_api_key',
        'whatsapp_api_key',
    ];

    /**
     * Tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get fiscal year string
     */
    public function getFiscalYear(): string
    {
        $month = $this->fiscal_year_start_month ?? 4;
        $currentMonth = (int) date('n');
        $currentYear = (int) date('Y');

        if ($currentMonth >= $month) {
            return $currentYear . '-' . ($currentYear + 1);
        }

        return ($currentYear - 1) . '-' . $currentYear;
    }
}
