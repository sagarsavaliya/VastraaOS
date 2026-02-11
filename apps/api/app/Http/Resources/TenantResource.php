<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'business_name' => $this->business_name,
            'display_name' => $this->display_name,
            'subdomain' => $this->subdomain,
            'custom_domain' => $this->custom_domain,
            'email' => $this->email,
            'mobile' => $this->mobile,
            'logo_url' => $this->logo_url,
            'status' => $this->status,
            'onboarding_completed' => $this->onboarding_completed,
            'onboarding_step' => $this->onboarding_step,
            'created_at' => $this->created_at->toISOString(),

            // Relationships
            'settings' => $this->whenLoaded('settings', fn() => new TenantSettingResource($this->settings)),
            'subscription' => $this->whenLoaded('subscription', fn() => new TenantSubscriptionResource($this->subscription)),
        ];
    }
}
