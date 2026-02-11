<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkerSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'work_type_id',
        'proficiency_level',
        'rate_per_piece',
        'rate_per_hour',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'rate_per_piece' => 'decimal:2',
        'rate_per_hour' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Worker
     */
    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    /**
     * Work type
     */
    public function workType(): BelongsTo
    {
        return $this->belongsTo(WorkType::class);
    }

    /**
     * Scope for active skills
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by proficiency level
     */
    public function scopeWithProficiency($query, string $level)
    {
        return $query->where('proficiency_level', $level);
    }
}
