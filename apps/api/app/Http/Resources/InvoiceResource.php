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
            'is_inter_state' => (bool) $this->is_inter_state,

            // Amounts
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'taxable_amount' => (float) $this->taxable_amount,
            'cgst_amount' => (float) $this->cgst_amount,
            'sgst_amount' => (float) $this->sgst_amount,
            'igst_amount' => (float) $this->igst_amount,
            'total_tax_amount' => (float) $this->total_tax_amount,
            'total_amount' => (float) $this->total_amount,
            'round_off_amount' => (float) ($this->round_off_amount ?? 0),
            'grand_total' => (float) ($this->grand_total ?? $this->total_amount),
            'amount_in_words' => $this->amount_in_words,
            'payment_status' => $this->payment_status,
            'amount_paid' => (float) ($this->amount_paid ?? 0),
            'amount_pending' => (float) ($this->amount_pending ?? 0),

            'notes' => $this->notes,
            'terms_conditions' => $this->terms_conditions,
            'eway_bill_number' => $this->eway_bill_number,
            'issued_at' => $this->issued_at?->toISOString(),
            'sent_at' => $this->sent_at?->toISOString(),
            'paid_at' => $this->paid_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'cancellation_reason' => $this->cancellation_reason,

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
