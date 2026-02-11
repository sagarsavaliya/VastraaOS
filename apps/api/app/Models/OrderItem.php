<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'order_id',
        'item_type_id',
        'item_name',
        'description',
        'quantity',
        'unit_price',
        'discount_amount',
        'tax_amount',
        'total_price',
        'hsn_code',
        'cgst_rate',
        'sgst_rate',
        'igst_rate',
        'size',
        'fit_type',
        'status',
        'current_workflow_stage_id',
        'assigned_worker_id',
        'assigned_user_id',
        'worker_payment_amount',
        'worker_payment_status',
        'estimated_completion_date',
        'actual_completion_date',
        'special_instructions',
        'reference_images',
        'display_order',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
        'cgst_rate' => 'decimal:2',
        'sgst_rate' => 'decimal:2',
        'igst_rate' => 'decimal:2',
        'worker_payment_amount' => 'decimal:2',
        'estimated_completion_date' => 'date',
        'actual_completion_date' => 'date',
        'reference_images' => 'array',
        'display_order' => 'integer',
    ];

    /**
     * Order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Item type
     */
    public function itemType(): BelongsTo
    {
        return $this->belongsTo(ItemType::class);
    }

    /**
     * Current workflow stage
     */
    public function currentWorkflowStage(): BelongsTo
    {
        return $this->belongsTo(WorkflowStage::class, 'current_workflow_stage_id');
    }

    /**
     * Assigned worker
     */
    public function assignedWorker(): BelongsTo
    {
        return $this->belongsTo(Worker::class, 'assigned_worker_id');
    }

    /**
     * Assigned staff user
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /**
     * Fabrics
     */
    public function fabrics(): HasMany
    {
        return $this->hasMany(ItemFabric::class);
    }

    /**
     * Embellishments
     */
    public function embellishments(): HasMany
    {
        return $this->hasMany(ItemEmbellishment::class);
    }

    /**
     * Stitching specs
     */
    public function stitchingSpecs(): HasOne
    {
        return $this->hasOne(ItemStitchingSpec::class);
    }

    /**
     * Additional works
     */
    public function additionalWorks(): HasMany
    {
        return $this->hasMany(ItemAdditionalWork::class);
    }

    /**
     * Cost estimate
     */
    public function costEstimate(): HasOne
    {
        return $this->hasOne(ItemCostEstimate::class);
    }

    /**
     * Workflow tasks
     */
    public function workflowTasks(): HasMany
    {
        return $this->hasMany(OrderWorkflowTask::class);
    }

    /**
     * Invoice items
     */
    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Get item name (custom or from type)
     */
    public function getNameAttribute(): string
    {
        return $this->item_name ?? $this->itemType?->name ?? 'Unknown Item';
    }

    /**
     * Calculate total price
     */
    public function calculateTotal(): void
    {
        $basePrice = $this->unit_price * $this->quantity;
        $taxableAmount = $basePrice - $this->discount_amount;
        $taxAmount = $taxableAmount * (($this->cgst_rate + $this->sgst_rate + $this->igst_rate) / 100);

        $this->update([
            'tax_amount' => $taxAmount,
            'total_price' => $taxableAmount + $taxAmount,
        ]);

        // Recalculate order totals
        $this->order->recalculateTotals();
    }
}
