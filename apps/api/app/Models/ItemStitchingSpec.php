<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemStitchingSpec extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'order_item_id',
        'stitching_type',
        'lining_required',
        'lining_type',
        'padding_required',
        'padding_areas',
        'zipper_type',
        'zipper_position',
        'hook_type',
        'dori_required',
        'elastic_required',
        'elastic_areas',
        'special_instructions',
        'estimated_cost',
        'estimated_days',
    ];

    protected $casts = [
        'lining_required' => 'boolean',
        'padding_required' => 'boolean',
        'padding_areas' => 'array',
        'dori_required' => 'boolean',
        'elastic_required' => 'boolean',
        'elastic_areas' => 'array',
        'estimated_cost' => 'decimal:2',
        'estimated_days' => 'integer',
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
