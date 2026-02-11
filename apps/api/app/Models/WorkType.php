<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkType extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'name_gujarati',
        'name_hindi',
        'description',
        'default_rate',
        'rate_unit',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'default_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Item embellishments using this work type
     */
    public function itemEmbellishments(): HasMany
    {
        return $this->hasMany(ItemEmbellishment::class);
    }

    /**
     * Worker skills for this work type
     */
    public function workerSkills(): HasMany
    {
        return $this->hasMany(WorkerSkill::class);
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
