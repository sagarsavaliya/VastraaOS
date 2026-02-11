<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ThemePreset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'is_dark',
        'colors',
        'is_system',
    ];

    protected $casts = [
        'is_dark' => 'boolean',
        'colors' => 'array',
        'is_system' => 'boolean',
    ];

    /**
     * Tenant theme settings using this preset
     */
    public function tenantThemeSettings(): HasMany
    {
        return $this->hasMany(TenantThemeSetting::class);
    }

    /**
     * Scope for system presets
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope for light themes
     */
    public function scopeLight($query)
    {
        return $query->where('is_dark', false);
    }

    /**
     * Scope for dark themes
     */
    public function scopeDark($query)
    {
        return $query->where('is_dark', true);
    }
}
