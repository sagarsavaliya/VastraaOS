<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowStage extends Model
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
        'stage_order',
        'is_mandatory',
        'is_skippable',
        'requires_photo',
        'requires_approval',
        'notify_customer',
        'estimated_days',
        'assigned_role',
        'allowed_transitions',
        'is_active',
    ];

    protected $casts = [
        'stage_order' => 'integer',
        'is_mandatory' => 'boolean',
        'is_skippable' => 'boolean',
        'requires_photo' => 'boolean',
        'requires_approval' => 'boolean',
        'notify_customer' => 'boolean',
        'estimated_days' => 'integer',
        'allowed_transitions' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Workflow tasks at this stage
     */
    public function workflowTasks(): HasMany
    {
        return $this->hasMany(OrderWorkflowTask::class);
    }

    /**
     * Orders currently at this stage
     */
    public function currentOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'current_workflow_stage_id');
    }

    /**
     * Scope for active stages
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered by stage order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('stage_order');
    }

    /**
     * Get next stage
     */
    public function getNextStage(): ?self
    {
        return static::where('tenant_id', $this->tenant_id)
            ->where('stage_order', '>', $this->stage_order)
            ->where('is_active', true)
            ->orderBy('stage_order')
            ->first();
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
