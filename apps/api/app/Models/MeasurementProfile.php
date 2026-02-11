<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class MeasurementProfile extends Model
{
    use HasFactory, BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'profile_name',
        'description',
        'body_type',
        'height_cm',
        'weight_kg',
        'is_default',
        'is_active',
        'created_by_user_id',
    ];

    protected $casts = [
        'height_cm' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Customer
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Measurement records
     */
    public function measurementRecords(): HasMany
    {
        return $this->hasMany(MeasurementRecord::class);
    }

    /**
     * Latest measurement record
     */
    public function latestRecord(): HasOne
    {
        return $this->hasOne(MeasurementRecord::class)->where('is_latest', true);
    }

    /**
     * Orders using this profile
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Created by user
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Scope for active profiles
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for default profile
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
