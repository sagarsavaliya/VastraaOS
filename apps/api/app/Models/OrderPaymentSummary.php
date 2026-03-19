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
        'total_invoiced_amount',
        'total_paid_amount',
        'pending_amount',
        'advance_amount',
        'total_invoices',
        'total_payments',
        'last_payment_date',
        'payment_status',
        'last_updated_at',
    ];

    protected $casts = [
        'total_order_amount' => 'decimal:2',
        'total_paid_amount' => 'decimal:2',
        'pending_amount' => 'decimal:2',
        'last_payment_date' => 'date',
        'last_updated_at' => 'datetime',
        'total_invoiced_amount' => 'decimal:2',
        'advance_amount' => 'decimal:2',
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
