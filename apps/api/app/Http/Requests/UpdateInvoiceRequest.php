<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_type'                 => 'sometimes|in:gst,non_gst',
            'invoice_date'                 => 'sometimes|date',
            'due_date'                     => 'nullable|date|after_or_equal:invoice_date',
            'notes'                        => 'nullable|string|max:1000',
            'terms_conditions'             => 'nullable|string|max:2000',
            'items'                        => 'sometimes|array|min:1',
            'items.*.description'          => 'required_with:items|string|max:255',
            'items.*.hsn_code'             => 'nullable|string|max:8',
            'items.*.quantity'             => 'required_with:items|numeric|min:0.01',
            'items.*.unit'                 => 'required_with:items|in:pcs,metres,sets,kg',
            'items.*.unit_price'           => 'required_with:items|numeric|min:0',
            'items.*.discount_amount'      => 'nullable|numeric|min:0',
            'items.*.gst_rate'             => 'nullable|numeric|min:0|max:100',
            'items.*.order_item_id'        => 'nullable|exists:order_items,id',
        ];
    }
}
