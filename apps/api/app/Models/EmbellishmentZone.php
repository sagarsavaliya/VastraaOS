<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmbellishmentZone extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'name_gujarati',
        'name_hindi',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Item embellishment zones
     */
    public function itemEmbellishmentZones(): HasMany
    {
        return $this->hasMany(ItemEmbellishmentZone::class);
    }

    /**
     * Scope for active items
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered by display order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
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
