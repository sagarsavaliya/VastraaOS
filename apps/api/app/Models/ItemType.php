<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemType extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'name_gujarati',
        'name_hindi',
        'description',
        'hsn_code',
        'default_gst_rate',
        'category',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'default_gst_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Order items of this type
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
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
