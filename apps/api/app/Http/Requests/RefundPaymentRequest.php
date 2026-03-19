<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RefundPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'refund_amount' => 'required|numeric|min:0.01',
            'refund_reason' => 'required|string|max:500',
            'refund_date'   => 'required|date',
        ];
    }
}
