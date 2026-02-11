<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeasurementRecord extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'measurement_profile_id',
        'recorded_date',
        'notes',
        'is_latest',
        'recorded_by_user_id',
    ];

    protected $casts = [
        'recorded_date' => 'date',
        'is_latest' => 'boolean',
    ];

    /**
     * Measurement profile
     */
    public function measurementProfile(): BelongsTo
    {
        return $this->belongsTo(MeasurementProfile::class);
    }

    /**
     * Measurement values
     */
    public function measurementValues(): HasMany
    {
        return $this->hasMany(MeasurementValue::class);
    }

    /**
     * Recorded by user
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    /**
     * Get value for a specific measurement type
     */
    public function getValueFor(int $measurementTypeId): ?float
    {
        $value = $this->measurementValues->firstWhere('measurement_type_id', $measurementTypeId);
        return $value?->value;
    }

    /**
     * Mark as latest and unmark previous
     */
    public function markAsLatest(): void
    {
        // Unmark previous latest
        static::where('measurement_profile_id', $this->measurement_profile_id)
            ->where('id', '!=', $this->id)
            ->update(['is_latest' => false]);

        // Mark this as latest
        $this->update(['is_latest' => true]);
    }
}
