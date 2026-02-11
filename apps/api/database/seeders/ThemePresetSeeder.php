<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ThemePresetSeeder extends Seeder
{
    public function run(): void
    {
        $presets = [
            [
                'name' => 'Naari Default',
                'slug' => 'naari-default',
                'is_dark' => false,
                'colors' => json_encode([
                    'primary' => [
                        '50' => '#faf5ff', '100' => '#f3e8ff', '200' => '#e9d5ff',
                        '300' => '#d8b4fe', '400' => '#c084fc', '500' => '#a855f7',
                        '600' => '#9333ea', '700' => '#7e22ce', '800' => '#6b21a8',
                        '900' => '#581c87', '950' => '#3b0764',
                    ],
                    'secondary' => [
                        '50' => '#ecfeff', '100' => '#cffafe', '200' => '#a5f3fc',
                        '300' => '#67e8f9', '400' => '#22d3ee', '500' => '#06b6d4',
                        '600' => '#0891b2', '700' => '#0e7490', '800' => '#155e75',
                        '900' => '#164e63', '950' => '#083344',
                    ],
                    'accent' => [
                        '500' => '#f59e0b',
                    ],
                    'success' => '#22c55e',
                    'warning' => '#f59e0b',
                    'error' => '#ef4444',
                    'info' => '#3b82f6',
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Naari Dark',
                'slug' => 'naari-dark',
                'is_dark' => true,
                'colors' => json_encode([
                    'primary' => [
                        '50' => '#faf5ff', '100' => '#f3e8ff', '200' => '#e9d5ff',
                        '300' => '#d8b4fe', '400' => '#c084fc', '500' => '#a855f7',
                        '600' => '#9333ea', '700' => '#7e22ce', '800' => '#6b21a8',
                        '900' => '#581c87', '950' => '#3b0764',
                    ],
                    'secondary' => [
                        '50' => '#ecfeff', '100' => '#cffafe', '200' => '#a5f3fc',
                        '300' => '#67e8f9', '400' => '#22d3ee', '500' => '#06b6d4',
                        '600' => '#0891b2', '700' => '#0e7490', '800' => '#155e75',
                        '900' => '#164e63', '950' => '#083344',
                    ],
                    'accent' => [
                        '500' => '#fbbf24',
                    ],
                    'success' => '#4ade80',
                    'warning' => '#fbbf24',
                    'error' => '#f87171',
                    'info' => '#60a5fa',
                    'background' => '#0a0a0a',
                    'surface' => '#171717',
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ocean Blue',
                'slug' => 'ocean-blue',
                'is_dark' => false,
                'colors' => json_encode([
                    'primary' => [
                        '50' => '#eff6ff', '100' => '#dbeafe', '200' => '#bfdbfe',
                        '300' => '#93c5fd', '400' => '#60a5fa', '500' => '#3b82f6',
                        '600' => '#2563eb', '700' => '#1d4ed8', '800' => '#1e40af',
                        '900' => '#1e3a8a', '950' => '#172554',
                    ],
                    'secondary' => [
                        '500' => '#06b6d4',
                    ],
                    'accent' => [
                        '500' => '#f97316',
                    ],
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rose Gold',
                'slug' => 'rose-gold',
                'is_dark' => false,
                'colors' => json_encode([
                    'primary' => [
                        '50' => '#fff1f2', '100' => '#ffe4e6', '200' => '#fecdd3',
                        '300' => '#fda4af', '400' => '#fb7185', '500' => '#f43f5e',
                        '600' => '#e11d48', '700' => '#be123c', '800' => '#9f1239',
                        '900' => '#881337', '950' => '#4c0519',
                    ],
                    'secondary' => [
                        '500' => '#d97706',
                    ],
                    'accent' => [
                        '500' => '#7c3aed',
                    ],
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Forest Green',
                'slug' => 'forest-green',
                'is_dark' => false,
                'colors' => json_encode([
                    'primary' => [
                        '50' => '#f0fdf4', '100' => '#dcfce7', '200' => '#bbf7d0',
                        '300' => '#86efac', '400' => '#4ade80', '500' => '#22c55e',
                        '600' => '#16a34a', '700' => '#15803d', '800' => '#166534',
                        '900' => '#14532d', '950' => '#052e16',
                    ],
                    'secondary' => [
                        '500' => '#0d9488',
                    ],
                    'accent' => [
                        '500' => '#eab308',
                    ],
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('theme_presets')->insert($presets);
    }
}
