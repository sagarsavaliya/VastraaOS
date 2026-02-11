<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'type',
        'provider',
        'provider_payment_method_id',
        'card_last_four',
        'card_brand',
        'card_exp_month',
        'card_exp_year',
        'upi_id',
        'bank_name',
        'is_default',
        'is_verified',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_verified' => 'boolean',
    ];

    protected $hidden = [
        'provider_payment_method_id',
    ];

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function getDisplayNameAttribute(): string
    {
        return match ($this->type) {
            'card' => ucfirst($this->card_brand) . ' ****' . $this->card_last_four,
            'upi' => $this->upi_id,
            'netbanking' => $this->bank_name,
            default => ucfirst($this->type),
        };
    }
}
