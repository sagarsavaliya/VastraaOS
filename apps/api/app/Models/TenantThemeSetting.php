<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantThemeSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'theme_preset_id',
        'custom_colors',
        'logo_url',
        'favicon_url',
        'sidebar_style',
        'sidebar_position',
        'navbar_style',
        'enable_dark_mode',
        'default_mode',
    ];

    protected $casts = [
        'custom_colors' => 'array',
        'enable_dark_mode' => 'boolean',
    ];

    /**
     * Tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Theme preset
     */
    public function themePreset(): BelongsTo
    {
        return $this->belongsTo(ThemePreset::class);
    }

    /**
     * Get merged colors (preset + custom overrides)
     */
    public function getMergedColors(): array
    {
        $presetColors = $this->themePreset?->colors ?? [];
        $customColors = $this->custom_colors ?? [];

        return array_merge($presetColors, $customColors);
    }
}
