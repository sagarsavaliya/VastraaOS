<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use OwenIt\Auditing\Contracts\Auditable;

class User extends Authenticatable implements Auditable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;
    use \OwenIt\Auditing\Auditable;

    protected $guard_name = 'api';

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'mobile',
        'avatar_url',
        'is_super_admin',
        'is_active',
        'last_login_at',
        'last_login_ip',
        'preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'preferences' => 'array',
        ];
    }

    /**
     * Tenant relationship
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin === true;
    }

    /**
     * Check if user is tenant owner
     */
    public function isOwner(): bool
    {
        return $this->hasRole('owner');
    }

    /**
     * Check if user is tenant manager
     */
    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    /**
     * Check if user is staff
     */
    public function isStaff(): bool
    {
        return $this->hasRole('staff');
    }

    /**
     * Check if user can access tenant
     */
    public function canAccessTenant(int $tenantId): bool
    {
        return $this->isSuperAdmin() || $this->tenant_id === $tenantId;
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for tenant users (exclude super admins)
     */
    public function scopeTenantUsers($query)
    {
        return $query->where('is_super_admin', false)->whereNotNull('tenant_id');
    }

    /**
     * Orders created by this user
     */
    public function createdOrders()
    {
        return $this->hasMany(Order::class, 'created_by_user_id');
    }

    /**
     * Orders assigned to this user
     */
    public function assignedOrders()
    {
        return $this->hasMany(Order::class, 'assigned_to_user_id');
    }

    /**
     * Workflow tasks assigned to this user
     */
    public function assignedTasks()
    {
        return $this->hasMany(OrderWorkflowTask::class, 'assigned_to_user_id');
    }
}
