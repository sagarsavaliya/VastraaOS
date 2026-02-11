<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerInquiry extends Model
{
    use HasFactory, BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'inquiry_number',
        'customer_id',
        'customer_name',
        'customer_mobile',
        'customer_email',
        'customer_type',
        'company_name',
        'designation',
        'company_address',
        'company_city',
        'company_state',
        'company_pincode',
        'company_gst',
        'address',
        'city',
        'state',
        'pincode',
        'source_id',
        'occasion_id',
        'budget_range_id',
        'item_type_id',
        'requirements',
        'event_date',
        'preferred_delivery_date',
        'appointment_datetime',
        'status',
        'notes',
        'reference_images',
        'assigned_to_user_id',
        'converted_to_order_id',
        'converted_at',
        'created_by_user_id',
    ];

    protected $casts = [
        'event_date' => 'date',
        'preferred_delivery_date' => 'date',
        'appointment_datetime' => 'datetime',
        'reference_images' => 'array',
        'converted_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(InquirySource::class, 'source_id');
    }

    public function occasion(): BelongsTo
    {
        return $this->belongsTo(Occasion::class);
    }

    public function budgetRange(): BelongsTo
    {
        return $this->belongsTo(BudgetRange::class);
    }

    public function itemType(): BelongsTo
    {
        return $this->belongsTo(ItemType::class);
    }

    public function convertedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'converted_to_order_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function isConverted(): bool
    {
        return $this->status === 'converted' && $this->converted_to_order_id !== null;
    }
}
