<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantSubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'billing_cycle' => $this->billing_cycle,
            'current_period_start' => $this->current_period_start?->toISOString(),
            'current_period_end' => $this->current_period_end?->toISOString(),
            'trial_ends_at' => $this->trial_ends_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),

            // Relationships
            'plan' => $this->whenLoaded('plan', fn() => new SubscriptionPlanResource($this->plan)),
        ];
    }
}
