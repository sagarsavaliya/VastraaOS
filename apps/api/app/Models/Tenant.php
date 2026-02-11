<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'business_name',
        'display_name',
        'subdomain',
        'custom_domain',
        'email',
        'mobile',
        'address',
        'city',
        'state',
        'state_code',
        'pincode',
        'logo_url',
        'favicon_url',
        'status',
        'onboarding_completed',
        'onboarding_step',
    ];

    protected $casts = [
        'onboarding_completed' => 'boolean',
        'onboarding_step' => 'integer',
    ];

    /**
     * Users belonging to this tenant
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Current subscription
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(TenantSubscription::class)->latest();
    }

    /**
     * All subscriptions
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class);
    }

    /**
     * Tenant settings
     */
    public function settings(): HasOne
    {
        return $this->hasOne(TenantSetting::class);
    }

    /**
     * Theme settings
     */
    public function themeSettings(): HasOne
    {
        return $this->hasOne(TenantThemeSetting::class);
    }

    /**
     * Customers
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * Orders
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Workers
     */
    public function workers(): HasMany
    {
        return $this->hasMany(Worker::class);
    }

    /**
     * Invoices
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Item types (master data)
     */
    public function itemTypes(): HasMany
    {
        return $this->hasMany(ItemType::class);
    }

    /**
     * Work types (master data)
     */
    public function workTypes(): HasMany
    {
        return $this->hasMany(WorkType::class);
    }

    /**
     * Workflow stages
     */
    public function workflowStages(): HasMany
    {
        return $this->hasMany(WorkflowStage::class);
    }

    /**
     * Check if tenant is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if tenant is on trial
     */
    public function isOnTrial(): bool
    {
        return $this->status === 'trial';
    }

    /**
     * Get current plan
     */
    public function getCurrentPlan(): ?SubscriptionPlan
    {
        return $this->subscription?->plan;
    }

    /**
     * Scope for active tenants
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
