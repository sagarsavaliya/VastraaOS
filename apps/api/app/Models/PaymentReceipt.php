<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PaymentReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'payment_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'uploaded_by_user_id',
    ];

    protected $appends = ['url'];

    /**
     * Payment this receipt belongs to
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * User who uploaded the receipt
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    /**
     * Accessor: public storage URL for the file
     */
    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }
}
