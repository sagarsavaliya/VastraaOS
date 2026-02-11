<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_name' => $this->item_name ?? $this->itemType?->name,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total_price' => (float) $this->total_price,
            'status' => $this->status,
            'hsn_code' => $this->hsn_code,
            'cgst_rate' => (float) $this->cgst_rate,
            'sgst_rate' => (float) $this->sgst_rate,
            'igst_rate' => (float) $this->igst_rate,
            'size' => $this->size,
            'fit_type' => $this->fit_type,
            'special_instructions' => $this->special_instructions,
            'reference_images' => $this->reference_images,
            'estimated_completion_date' => $this->estimated_completion_date?->format('Y-m-d'),
            'actual_completion_date' => $this->actual_completion_date?->format('Y-m-d'),
            'display_order' => $this->display_order,

            // Relationships
            'item_type' => $this->whenLoaded('itemType', fn() => [
                'id' => $this->itemType->id,
                'name' => $this->itemType->name,
                'hsn_code' => $this->itemType->hsn_code,
                'gst_rate' => (float) $this->itemType->gst_rate,
            ]),
            'current_workflow_stage' => $this->whenLoaded('currentWorkflowStage', fn() => [
                'id' => $this->currentWorkflowStage->id,
                'name' => $this->currentWorkflowStage->name,
                'code' => $this->currentWorkflowStage->code,
            ]),
            'assigned_worker' => $this->whenLoaded('assignedWorker', fn() => [
                'id' => $this->assignedWorker->id,
                'name' => $this->assignedWorker->name,
            ]),
            'fabrics' => $this->whenLoaded('fabrics'),
            'embellishments' => $this->whenLoaded('embellishments'),
            'stitching_specs' => $this->whenLoaded('stitchingSpecs'),
            'additional_works' => $this->whenLoaded('additionalWorks'),
            'cost_estimate' => $this->whenLoaded('costEstimate'),
        ];
    }
}
