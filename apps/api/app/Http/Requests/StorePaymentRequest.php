<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id'              => 'required|exists:orders,id',
            'invoice_id'            => 'nullable|exists:invoices,id',
            'amount'                => 'required|numeric|min:0.01',
            'payment_date'          => 'required|date',
            'payment_mode'          => 'required|in:cash,upi,card,cheque,bank_transfer',
            'transaction_reference' => 'nullable|string|max:100',
            'cheque_number'         => 'nullable|string|max:50',
            'cheque_date'           => 'nullable|date',
            'bank_name'             => 'nullable|string|max:100',
            'notes'                 => 'nullable|string|max:500',
            'advance_payment'       => 'nullable|boolean',
        ];
    }
}
