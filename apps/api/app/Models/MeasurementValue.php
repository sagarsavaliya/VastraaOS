<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeasurementValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'measurement_record_id',
        'measurement_type_id',
        'value',
        'unit',
        'notes',
    ];

    protected $casts = [
        'value' => 'decimal:2',
    ];

    /**
     * Measurement record
     */
    public function measurementRecord(): BelongsTo
    {
        return $this->belongsTo(MeasurementRecord::class);
    }

    /**
     * Measurement type
     */
    public function measurementType(): BelongsTo
    {
        return $this->belongsTo(MeasurementType::class);
    }
}
