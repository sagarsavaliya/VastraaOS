<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemEmbellishmentZone extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'item_embellishment_id',
        'embellishment_zone_id',
        'notes',
    ];

    public function itemEmbellishment(): BelongsTo
    {
        return $this->belongsTo(ItemEmbellishment::class);
    }

    public function embellishmentZone(): BelongsTo
    {
        return $this->belongsTo(EmbellishmentZone::class);
    }
}
