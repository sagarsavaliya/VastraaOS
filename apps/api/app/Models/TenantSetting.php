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
        'gst_module_enabled',
        'gst_number',
        'gst_registered_name',
        'pan_number',
        'hidden_gst_percentage',
        'gst_invoice_prefix',
        'non_gst_invoice_prefix',
        'order_prefix',
        'financial_year_start',
        'currency',
        'timezone',
        'date_format',
        'measurement_unit',
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
        'gst_module_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'whatsapp_enabled' => 'boolean',
        'email_enabled' => 'boolean',
        'financial_year_start' => 'integer',
        'hidden_gst_percentage' => 'decimal:2',
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
