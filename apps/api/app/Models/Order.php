<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Order extends Model implements Auditable
{
    use HasFactory, BelongsToTenant, SoftDeletes;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'tenant_id',
        'order_number',
        'customer_id',
        'measurement_profile_id',
        'inquiry_id',
        'occasion_id',
        'status_id',
        'priority_id',
        'order_date',
        'event_date',
        'promised_delivery_date',
        'estimated_delivery_date',
        'actual_delivery_date',
        'subtotal',
        'discount_amount',
        'discount_type',
        'discount_value',
        'priority_surcharge',
        'tax_amount',
        'total_amount',
        'amount_paid',
        'amount_pending',
        'payment_status',
        'delivery_address_line1',
        'delivery_address_line2',
        'delivery_city',
        'delivery_state',
        'delivery_pincode',
        'use_customer_address',
        'special_instructions',
        'internal_notes',
        'reference_images',
        'tags',
        'current_workflow_stage_id',
        'workflow_completion_percentage',
        'confirmed_at',
        'started_at',
        'completed_at',
        'delivered_at',
        'cancelled_at',
        'cancellation_reason',
        'assigned_to_user_id',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected $casts = [
        'order_date' => 'date',
        'event_date' => 'date',
        'promised_delivery_date' => 'date',
        'estimated_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'priority_surcharge' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'amount_pending' => 'decimal:2',
        'reference_images' => 'array',
        'tags' => 'array',
        'workflow_completion_percentage' => 'integer',
        'confirmed_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Customer
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Measurement profile
     */
    public function measurementProfile(): BelongsTo
    {
        return $this->belongsTo(MeasurementProfile::class);
    }

    /**
     * Inquiry
     */
    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(CustomerInquiry::class, 'inquiry_id');
    }

    /**
     * Occasion
     */
    public function occasion(): BelongsTo
    {
        return $this->belongsTo(Occasion::class);
    }

    /**
     * Status
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(OrderStatus::class, 'status_id');
    }

    /**
     * Priority
     */
    public function priority(): BelongsTo
    {
        return $this->belongsTo(OrderPriority::class, 'priority_id');
    }

    /**
     * Current workflow stage
     */
    public function currentWorkflowStage(): BelongsTo
    {
        return $this->belongsTo(WorkflowStage::class, 'current_workflow_stage_id');
    }

    /**
     * Order items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Workflow tasks
     */
    public function workflowTasks(): HasMany
    {
        return $this->hasMany(OrderWorkflowTask::class);
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
     * Payment summary
     */
    public function paymentSummary(): HasOne
    {
        return $this->hasOne(OrderPaymentSummary::class);
    }

    /**
     * Assigned to user
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    /**
     * Created by user
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Updated by user
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    /**
     * Recalculate totals
     */
    public function recalculateTotals(): void
    {
        $subtotal = $this->items->sum('total_price');
        $discountAmount = $this->discount_type === 'percentage'
            ? $subtotal * ($this->discount_value / 100)
            : $this->discount_value;

        $taxAmount = $this->items->sum('tax_amount');
        $prioritySurcharge = $this->priority?->calculateSurcharge($subtotal) ?? 0;

        $this->update([
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'priority_surcharge' => $prioritySurcharge,
            'total_amount' => $subtotal - $discountAmount + $taxAmount + $prioritySurcharge,
            'amount_pending' => ($subtotal - $discountAmount + $taxAmount + $prioritySurcharge) - $this->amount_paid,
        ]);
    }

    /**
     * Scope for pending payment orders
     */
    public function scopePendingPayment($query)
    {
        return $query->where('payment_status', 'pending');
    }

    /**
     * Scope for overdue orders
     */
    public function scopeOverdue($query)
    {
        return $query->where('promised_delivery_date', '<', now())
            ->whereNull('delivered_at');
    }

    /**
     * Scope search
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('order_number', 'like', "%{$search}%")
              ->orWhereHas('customer', function ($cq) use ($search) {
                  $cq->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
              });
        });
    }
}
