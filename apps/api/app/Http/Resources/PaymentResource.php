<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'payment_number'        => $this->payment_number,
            'amount'                => (float) $this->amount,
            'payment_date'          => $this->payment_date?->format('Y-m-d'),
            'payment_mode'          => $this->payment_mode,
            'transaction_reference' => $this->transaction_reference,
            'cheque_number'         => $this->cheque_number,
            'cheque_date'           => $this->cheque_date?->format('Y-m-d'),
            'bank_name'             => $this->bank_name,
            'status'                => $this->status,
            'advance_payment'       => (bool) $this->advance_payment,
            'refund_amount'         => $this->refund_amount ? (float) $this->refund_amount : null,
            'refund_date'           => $this->refund_date?->format('Y-m-d'),
            'refund_reason'         => $this->refund_reason,
            'notes'                 => $this->notes,
            'voided_at'             => $this->voided_at?->toISOString(),
            'void_reason'           => $this->void_reason,

            // Relationships (loaded via eager load)
            'customer'  => $this->whenLoaded('order', function () {
                $customer = $this->order?->customer;
                if (!$customer) {
                    return null;
                }
                return [
                    'id'     => $customer->id,
                    'name'   => $customer->name,
                    'mobile' => $customer->mobile,
                ];
            }),
            'order'   => $this->whenLoaded('order', fn() => $this->order ? [
                'id'           => $this->order->id,
                'order_number' => $this->order->order_number,
            ] : null),
            'invoice' => $this->whenLoaded('invoice', fn() => $this->invoice ? [
                'id'             => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
            ] : null),
            'receipts' => PaymentReceiptResource::collection($this->whenLoaded('receipts')),

            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
