<?php

namespace Database\Seeders;

use App\Models\HsnCode;
use Illuminate\Database\Seeder;

class HsnCodeSeeder extends Seeder
{
    /**
     * Common textile and garment HSN codes with their standard GST rates.
     * tenant_id = null means system-wide defaults visible to all tenants.
     */
    public function run(): void
    {
        $codes = [
            ['hsn_code' => '5007', 'description' => 'Woven fabrics of silk or silk waste', 'gst_rate' => 5.00],
            ['hsn_code' => '5208', 'description' => 'Woven fabrics of cotton (<=200 g/m²)', 'gst_rate' => 5.00],
            ['hsn_code' => '5515', 'description' => 'Woven fabrics of synthetic staple fibres', 'gst_rate' => 12.00],
            ['hsn_code' => '6101', 'description' => "Men's overcoats, carcoats, capes (knitted)", 'gst_rate' => 12.00],
            ['hsn_code' => '6104', 'description' => "Women's suits, dresses, skirts (knitted)", 'gst_rate' => 12.00],
            ['hsn_code' => '6204', 'description' => "Women's suits, dresses, skirts (woven)", 'gst_rate' => 12.00],
            ['hsn_code' => '6211', 'description' => 'Tracksuits, ski suits, swimwear', 'gst_rate' => 12.00],
            ['hsn_code' => '6301', 'description' => 'Blankets and travelling rugs', 'gst_rate' => 5.00],
            ['hsn_code' => '6302', 'description' => 'Bed linen, table linen, toilet and kitchen linen', 'gst_rate' => 5.00],
            ['hsn_code' => '6303', 'description' => 'Curtains, drapes, interior blinds, curtain valances', 'gst_rate' => 12.00],
            ['hsn_code' => '6308', 'description' => 'Needlecraft sets of woven fabric and yarn', 'gst_rate' => 12.00],
            ['hsn_code' => '9619', 'description' => 'Sanitary towels, tampons, napkins and similar articles', 'gst_rate' => 12.00],
        ];

        foreach ($codes as $data) {
            HsnCode::updateOrCreate(
                [
                    'tenant_id' => null,
                    'hsn_code'  => $data['hsn_code'],
                ],
                [
                    'description' => $data['description'],
                    'gst_rate'    => $data['gst_rate'],
                    'is_active'   => true,
                ]
            );
        }

        $this->command->info('HSN codes seeded successfully (' . count($codes) . ' entries).');
    }
}
