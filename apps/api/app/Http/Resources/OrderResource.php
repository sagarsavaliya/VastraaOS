<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'order_date' => $this->order_date?->format('Y-m-d'),
            'promised_delivery_date' => $this->promised_delivery_date?->format('Y-m-d'),
            'special_instructions' => $this->special_instructions,
            'items_count' => (int) $this->items_count,

            // Amounts
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total_amount' => (float) $this->total_amount,

            // Status info
            'status' => $this->whenLoaded('status', fn() => [
                'id' => $this->status->id,
                'name' => $this->status->name,
                'code' => $this->status->code,
                'color' => $this->status->color,
            ]),
            'priority' => $this->whenLoaded('priority', fn() => [
                'id' => $this->priority->id,
                'name' => $this->priority->name,
                'code' => $this->priority->code,
                'color' => $this->priority->color,
            ]),

            // Relationships
            'customer' => $this->whenLoaded('customer', fn() => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'mobile' => $this->customer->mobile,
                'email' => $this->customer->email,
            ]),
            'occasion' => $this->whenLoaded('occasion', fn() => [
                'id' => $this->occasion->id,
                'name' => $this->occasion->name,
            ]),
            'measurement_profile' => $this->whenLoaded('measurementProfile'),
            'items' => $this->whenLoaded('items', fn() => OrderItemResource::collection($this->items)),
            'workflow_tasks' => $this->whenLoaded('workflowTasks'),
            'payment_summary' => $this->whenLoaded('paymentSummary', fn() => [
                'total_amount' => (float) $this->paymentSummary->total_order_amount,
                'paid_amount' => (float) $this->paymentSummary->total_paid_amount,
                'pending_amount' => (float) $this->paymentSummary->pending_amount,
                'payment_status' => $this->payment_status, // Use status from Order model
            ]),

            'created_by' => $this->whenLoaded('createdBy', fn() => [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ]),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
