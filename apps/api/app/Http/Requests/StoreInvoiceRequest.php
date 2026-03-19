<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id'                     => 'required|exists:orders,id',
            'invoice_type'                 => 'required|in:gst,non_gst',
            'invoice_date'                 => 'required|date',
            'due_date'                     => 'nullable|date|after_or_equal:invoice_date',
            'notes'                        => 'nullable|string|max:1000',
            'terms_conditions'             => 'nullable|string|max:2000',
            'items'                        => 'required|array|min:1',
            'items.*.description'          => 'required|string|max:255',
            'items.*.hsn_code'             => 'nullable|string|max:8',
            'items.*.quantity'             => 'required|numeric|min:0.01',
            'items.*.unit'                 => 'required|in:pcs,metres,sets,kg',
            'items.*.unit_price'           => 'required|numeric|min:0',
            'items.*.discount_amount'      => 'nullable|numeric|min:0',
            'items.*.gst_rate'             => 'nullable|numeric|min:0|max:100',
            'items.*.order_item_id'        => 'nullable|exists:order_items,id',
        ];
    }
}
