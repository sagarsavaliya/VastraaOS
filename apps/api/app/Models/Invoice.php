<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Invoice extends Model implements Auditable
{
    use HasFactory, BelongsToTenant, SoftDeletes;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'tenant_id',
        'invoice_number',
        'order_id',
        'customer_id',
        'invoice_type',
        'is_split_invoice',
        'invoice_date',
        'due_date',
        'billing_name',
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_state_code',
        'billing_pincode',
        'billing_gst_number',
        'seller_name',
        'seller_address',
        'seller_city',
        'seller_state',
        'seller_state_code',
        'seller_pincode',
        'seller_gst_number',
        'seller_pan_number',
        'subtotal',
        'discount_amount',
        'taxable_amount',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'total_tax_amount',
        'total_amount',
        'round_off_amount',
        'grand_total',
        'amount_in_words',
        'amount_paid',
        'amount_pending',
        'payment_status',
        'eway_bill_number',
        'eway_bill_date',
        'status',
        'issued_at',
        'cancelled_at',
        'cancellation_reason',
        'notes',
        'terms_conditions',
        'pdf_url',
        'created_by_user_id',
    ];

    protected $casts = [
        'is_split_invoice' => 'boolean',
        'invoice_date' => 'date',
        'due_date' => 'date',
        'eway_bill_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'taxable_amount' => 'decimal:2',
        'cgst_amount' => 'decimal:2',
        'sgst_amount' => 'decimal:2',
        'igst_amount' => 'decimal:2',
        'total_tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'round_off_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'amount_pending' => 'decimal:2',
        'issued_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Customer
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Invoice items
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Payments
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Created by user
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Check if GST invoice
     */
    public function isGstInvoice(): bool
    {
        return $this->invoice_type === 'gst';
    }

    /**
     * Check if paid
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Check if overdue
     */
    public function isOverdue(): bool
    {
        return $this->payment_status !== 'paid' && $this->due_date && $this->due_date->isPast();
    }

    /**
     * Scope for GST invoices
     */
    public function scopeGst($query)
    {
        return $query->where('invoice_type', 'gst');
    }

    /**
     * Scope for non-GST invoices
     */
    public function scopeNonGst($query)
    {
        return $query->where('invoice_type', 'non_gst');
    }

    /**
     * Scope for unpaid invoices
     */
    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', '!=', 'paid');
    }

    /**
     * Scope for overdue invoices
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->where('payment_status', '!=', 'paid');
    }
}
