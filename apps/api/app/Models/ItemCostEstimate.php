<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemCostEstimate extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'order_item_id',
        'fabric_cost',
        'embellishment_cost',
        'stitching_cost',
        'additional_work_cost',
        'staff_expense',
        'packing_cost',
        'other_cost',
        'total_cost',
        'selling_price',
        'profit_amount',
        'profit_percentage',
        'estimated_total_days',
        'notes',
    ];

    protected $casts = [
        'fabric_cost' => 'decimal:2',
        'embellishment_cost' => 'decimal:2',
        'stitching_cost' => 'decimal:2',
        'additional_work_cost' => 'decimal:2',
        'staff_expense' => 'decimal:2',
        'packing_cost' => 'decimal:2',
        'other_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'profit_amount' => 'decimal:2',
        'profit_percentage' => 'decimal:2',
        'estimated_total_days' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * Calculate profit from selling price and total cost
     */
    public function calculateProfit(): void
    {
        $this->profit_amount = $this->selling_price - $this->total_cost;
        if ($this->total_cost > 0) {
            $this->profit_percentage = ($this->profit_amount / $this->total_cost) * 100;
        }
    }

    /**
     * Calculate total cost from individual costs
     */
    public function calculateTotalCost(): void
    {
        $this->total_cost = $this->fabric_cost
            + $this->embellishment_cost
            + $this->stitching_cost
            + $this->additional_work_cost
            + $this->staff_expense
            + $this->packing_cost
            + $this->other_cost;
    }
}
