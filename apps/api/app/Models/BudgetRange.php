<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetRange extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'name_gujarati',
        'name_hindi',
        'min_amount',
        'max_amount',
        'currency',
        'description',
        'color',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    public function getDisplayRangeAttribute(): string
    {
        $min = number_format($this->min_amount);
        if ($this->max_amount === null) {
            return "₹{$min}+";
        }
        $max = number_format($this->max_amount);
        return "₹{$min} - ₹{$max}";
    }
}
