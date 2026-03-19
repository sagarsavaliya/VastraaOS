<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'file_name'  => $this->file_name,
            'url'        => $this->url,
            'file_size'  => $this->file_size,
            'mime_type'  => $this->mime_type,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
