<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Customer extends Model implements Auditable
{
    use HasFactory, BelongsToTenant, SoftDeletes;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'tenant_id',
        'customer_code',
        'customer_type',
        'first_name',
        'last_name',
        'company_name',
        'designation',
        'company_address',
        'company_city',
        'company_state',
        'company_pincode',
        'display_name',
        'email',
        'mobile',
        'alternate_mobile',
        'whatsapp_number',
        'date_of_birth',
        'anniversary_date',
        'gender',
        'address',
        'city',
        'state',
        'pincode',
        'gst_number',
        'notes',
        'profile_photo_url',
        'customer_type',
        'status',
        'preferences',
        'tags',
        'referred_by_customer_id',
        'created_by_user_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'anniversary_date' => 'date',
        'preferences' => 'array',
        'tags' => 'array',
    ];

    /**
     * Measurement profiles
     */
    public function measurementProfiles(): HasMany
    {
        return $this->hasMany(MeasurementProfile::class);
    }

    /**
     * Default measurement profile
     */
    public function defaultMeasurementProfile()
    {
        return $this->hasOne(MeasurementProfile::class)->where('is_default', true);
    }

    /**
     * Orders
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Inquiries
     */
    public function inquiries(): HasMany
    {
        return $this->hasMany(CustomerInquiry::class);
    }

    /**
     * Invoices
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Payments
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Referrer (customer who referred this customer)
     */
    public function referrer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'referred_by_customer_id');
    }

    /**
     * Referrals (customers referred by this customer)
     */
    public function referrals(): HasMany
    {
        return $this->hasMany(Customer::class, 'referred_by_customer_id');
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
     * Scope for active customers
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Search scope
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('display_name', 'like', "%{$search}%")
              ->orWhere('mobile', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('customer_code', 'like', "%{$search}%");
        });
    }
}
