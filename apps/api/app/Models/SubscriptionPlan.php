<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_yearly',
        'currency',
        'features',
        'limits',
        'is_active',
        'is_featured',
        'trial_days',
        'display_order',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
        'features' => 'array',
        'limits' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'trial_days' => 'integer',
        'display_order' => 'integer',
    ];

    /**
     * Subscriptions using this plan
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class, 'plan_id');
    }

    /**
     * Get active plans
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get featured plans
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Check if plan has a specific feature
     */
    public function hasFeature(string $feature): bool
    {
        return isset($this->features[$feature]) && $this->features[$feature] === true;
    }

    /**
     * Get feature value
     */
    public function getFeatureValue(string $feature, $default = null)
    {
        return $this->features[$feature] ?? $default;
    }

    /**
     * Get limit value
     */
    public function getLimit(string $limit, $default = null)
    {
        return $this->limits[$limit] ?? $default;
    }

    /**
     * Check if limit is unlimited (-1)
     */
    public function isUnlimited(string $limit): bool
    {
        return ($this->limits[$limit] ?? 0) === -1;
    }
}
