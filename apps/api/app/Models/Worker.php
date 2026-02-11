<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Worker extends Model implements Auditable
{
    use HasFactory, BelongsToTenant, SoftDeletes;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'tenant_id',
        'worker_code',
        'first_name',
        'last_name',
        'display_name',
        'mobile',
        'alternate_mobile',
        'email',
        'address',
        'city',
        'state',
        'pincode',
        'bank_name',
        'bank_account_number',
        'bank_ifsc_code',
        'upi_id',
        'pan_number',
        'worker_type',
        'default_rate',
        'rate_type',
        'notes',
        'profile_photo_url',
        'status',
        'is_active',
        'joined_date',
        'created_by_user_id',
    ];

    protected $casts = [
        'default_rate' => 'decimal:2',
        'joined_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'bank_account_number',
        'pan_number',
    ];

    /**
     * Skills
     */
    public function skills(): HasMany
    {
        return $this->hasMany(WorkerSkill::class);
    }

    /**
     * Assigned order items
     */
    public function assignedOrderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'assigned_worker_id');
    }

    /**
     * Assigned embellishments
     */
    public function assignedEmbellishments(): HasMany
    {
        return $this->hasMany(ItemEmbellishment::class, 'assigned_worker_id');
    }

    /**
     * Workflow tasks assigned
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(OrderWorkflowTask::class, 'assigned_to_worker_id');
    }

    /**
     * Created by user
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get full name
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get display name or full name
     */
    public function getNameAttribute(): string
    {
        return $this->display_name ?? $this->full_name;
    }

    /**
     * Scope for active workers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for workers with a specific skill
     */
    public function scopeWithSkill($query, int $workTypeId)
    {
        return $query->whereHas('skills', function ($q) use ($workTypeId) {
            $q->where('work_type_id', $workTypeId)->where('is_active', true);
        });
    }

    /**
     * Get rate for a specific work type
     */
    public function getRateForWorkType(int $workTypeId): ?float
    {
        $skill = $this->skills->firstWhere('work_type_id', $workTypeId);
        return $skill?->rate_per_piece ?? $this->default_rate;
    }
}
