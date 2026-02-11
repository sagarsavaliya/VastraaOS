<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderStatus extends Model
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
        'is_default',
        'is_final',
        'is_active',
        'display_order',
        'allowed_transitions',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_final' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'allowed_transitions' => 'array',
    ];

    /**
     * Orders with this status
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'status_id');
    }

    /**
     * Scope for active statuses
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for default status
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
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
