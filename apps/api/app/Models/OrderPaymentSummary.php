<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPaymentSummary extends Model
{
    use HasFactory;

    protected $table = 'order_payment_summary';

    protected $fillable = [
        'order_id',
        'total_order_amount',
        'total_paid_amount',
        'pending_amount',
        'last_payment_date',
    ];

    protected $casts = [
        'total_order_amount' => 'decimal:2',
        'total_paid_amount' => 'decimal:2',
        'pending_amount' => 'decimal:2',
        'last_payment_date' => 'date',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if order is fully paid
     */
    public function isFullyPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Get ughrani (pending amount)
     */
    public function getUghraniAttribute(): float
    {
        return (float) $this->pending_amount;
    }
}
