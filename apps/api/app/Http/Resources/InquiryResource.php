<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InquiryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inquiry_number' => $this->inquiry_number,
            'customer_id' => $this->customer_id,
            'customer_name' => $this->customer_name,
            'customer_mobile' => $this->customer_mobile,
            'customer_email' => $this->customer_email,
            'customer_type' => $this->customer_type,
            'company_name' => $this->company_name,
            'designation' => $this->designation,
            'company_address' => $this->company_address,
            'company_city' => $this->company_city,
            'company_state' => $this->company_state,
            'company_pincode' => $this->company_pincode,
            'company_gst' => $this->company_gst,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'pincode' => $this->pincode,
            
            'requirements' => $this->requirements,
            'event_date' => $this->event_date?->format('Y-m-d'),
            'preferred_delivery_date' => $this->preferred_delivery_date?->format('Y-m-d'),
            'appointment_datetime' => $this->appointment_datetime?->format('Y-m-d H:i:s'),
            'status' => $this->status,
            'notes' => $this->notes,
            'reference_images' => $this->reference_images,
            
            // Relationships
            'customer' => $this->whenLoaded('customer', fn() => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'mobile' => $this->customer->mobile,
            ]),
            'source' => $this->whenLoaded('source', fn() => [
                'id' => $this->source->id,
                'name' => $this->source->name,
            ]),
            'occasion' => $this->whenLoaded('occasion', fn() => [
                'id' => $this->occasion->id,
                'name' => $this->occasion->name,
            ]),
            'budget_range' => $this->whenLoaded('budgetRange', fn() => [
                'id' => $this->budgetRange->id,
                'name' => $this->budgetRange->name,
            ]),
            'item_type' => $this->whenLoaded('itemType', fn() => [
                'id' => $this->itemType->id,
                'name' => $this->itemType->name,
            ]),
            
            'assigned_to' => $this->whenLoaded('assignedTo', fn() => [
                'id' => $this->assignedTo->id,
                'name' => $this->assignedTo->name,
            ]),
            'converted_order' => $this->whenLoaded('convertedOrder'),
            'converted_at' => $this->converted_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
