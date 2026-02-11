<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'invoice_type' => $this->invoice_type,
            'invoice_date' => $this->invoice_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'status' => $this->status,

            // Billing info
            'billing_name' => $this->billing_name,
            'billing_address' => $this->billing_address,
            'billing_city' => $this->billing_city,
            'billing_state' => $this->billing_state,
            'billing_pincode' => $this->billing_pincode,
            'billing_gstin' => $this->billing_gstin,

            // Seller info
            'seller_gstin' => $this->seller_gstin,
            'seller_name' => $this->seller_name,
            'place_of_supply' => $this->place_of_supply,
            'is_inter_state' => $this->is_inter_state,

            // Amounts
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'taxable_amount' => (float) $this->taxable_amount,
            'cgst_amount' => (float) $this->cgst_amount,
            'sgst_amount' => (float) $this->sgst_amount,
            'igst_amount' => (float) $this->igst_amount,
            'total_tax_amount' => (float) $this->total_tax_amount,
            'total_amount' => (float) $this->total_amount,
            'amount_in_words' => $this->amount_in_words,

            'notes' => $this->notes,
            'e_way_bill_number' => $this->e_way_bill_number,
            'sent_at' => $this->sent_at?->toISOString(),
            'paid_at' => $this->paid_at?->toISOString(),

            // Relationships
            'customer' => $this->whenLoaded('customer', fn() => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'mobile' => $this->customer->mobile,
            ]),
            'order' => $this->whenLoaded('order', fn() => [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
            ]),
            'items' => $this->whenLoaded('items'),
            'payments' => $this->whenLoaded('payments'),

            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
