<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderPriority extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'name_gujarati',
        'name_hindi',
        'code',
        'description',
        'color',
        'icon',
        'surcharge_percentage',
        'surcharge_flat',
        'priority_level',
        'days_reduction',
        'is_default',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'surcharge_percentage' => 'decimal:2',
        'surcharge_flat' => 'decimal:2',
        'priority_level' => 'integer',
        'days_reduction' => 'integer',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Orders with this priority
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'priority_id');
    }

    /**
     * Scope for active priorities
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Calculate surcharge for a given amount
     */
    public function calculateSurcharge(float $amount): float
    {
        $percentageSurcharge = $amount * ($this->surcharge_percentage / 100);
        return $percentageSurcharge + $this->surcharge_flat;
    }

    /**
     * Get localized name
     */
    public function getLocalizedName(string $locale = 'en'): string
    {
        return match ($locale) {
            'gu' => $this->name_gujarati ?? $this->name,
            'hi' => $this->name_hindi ?? $this->name,
            default => $this->name,
        };
    }
}
