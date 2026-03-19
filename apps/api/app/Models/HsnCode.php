<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HsnCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'hsn_code',
        'description',
        'gst_rate',
        'is_active',
    ];

    protected $casts = [
        'gst_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Tenant (nullable — null means system default)
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope: active HSN codes only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
