<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'gst_module_enabled' => $this->gst_module_enabled,
            'gst_number' => $this->gst_number,
            'gst_registered_name' => $this->gst_registered_name,
            'gst_invoice_prefix' => $this->gst_invoice_prefix,
            'non_gst_invoice_prefix' => $this->non_gst_invoice_prefix,
            'order_prefix' => $this->order_prefix,
            'financial_year_start' => $this->financial_year_start,
            'currency' => $this->currency,
            'timezone' => $this->timezone,
            'measurement_unit' => $this->measurement_unit,
        ];
    }
}
