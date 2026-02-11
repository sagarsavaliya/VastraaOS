<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_code' => $this->customer_code,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'display_name' => $this->display_name,
            'name' => $this->name,
            'gender' => $this->gender,
            'mobile' => $this->mobile,
            'alternate_mobile' => $this->alternate_mobile,
            'email' => $this->email,
            'whatsapp_number' => $this->whatsapp_number,
            'customer_type' => $this->customer_type,
            'company_name' => $this->company_name,
            'designation' => $this->designation,
            'company_address' => $this->company_address,
            'company_city' => $this->company_city,
            'company_state' => $this->company_state,
            'company_pincode' => $this->company_pincode,
            'gst_number' => $this->gst_number,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'pincode' => $this->pincode,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'anniversary_date' => $this->anniversary_date?->format('Y-m-d'),
            'preferred_language' => $this->preferred_language,
            'notes' => $this->notes,
            'tags' => $this->tags,
            'status' => $this->status,
            'orders_count' => (int) $this->orders_count,
            'total_spent' => (float) $this->total_spent,
            'created_at' => $this->created_at->toISOString(),

            // Relationships
            'measurement_profiles' => $this->whenLoaded('measurementProfiles'),
            'orders' => $this->whenLoaded('orders'),
            'inquiries' => $this->whenLoaded('inquiries'),
        ];
    }
}
