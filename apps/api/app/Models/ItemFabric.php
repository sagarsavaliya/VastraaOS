<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemFabric extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'order_item_id',
        'fabric_type',
        'fabric_description',
        'color',
        'quantity_meters',
        'is_customer_provided',
        'fabric_cost',
        'notes',
    ];

    protected $casts = [
        'quantity_meters' => 'decimal:2',
        'is_customer_provided' => 'boolean',
        'fabric_cost' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
