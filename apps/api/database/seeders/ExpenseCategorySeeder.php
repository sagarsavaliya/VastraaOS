<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Seed for all tenants that exist
        $tenantIds = DB::table('tenants')->pluck('id');

        foreach ($tenantIds as $tenantId) {
            // Skip if this tenant already has categories
            $exists = DB::table('expense_categories')->where('tenant_id', $tenantId)->exists();
            if ($exists) continue;

            $now = now();

            $categories = [
                // Business categories
                ['name' => 'Salary & Payroll',         'type' => 'business', 'requires_approval' => true,  'color' => '#3b82f6'],
                ['name' => 'Office Supplies',           'type' => 'business', 'requires_approval' => false, 'color' => '#6366f1'],
                ['name' => 'Rent & Utilities',          'type' => 'business', 'requires_approval' => true,  'color' => '#8b5cf6'],
                ['name' => 'Marketing & Advertising',   'type' => 'business', 'requires_approval' => true,  'color' => '#ec4899'],
                ['name' => 'Travel & Transport',        'type' => 'business', 'requires_approval' => false, 'color' => '#14b8a6'],
                ['name' => 'Food & Entertainment',      'type' => 'business', 'requires_approval' => false, 'color' => '#f59e0b'],
                ['name' => 'Software & Subscriptions',  'type' => 'business', 'requires_approval' => true,  'color' => '#10b981'],
                ['name' => 'Equipment & Maintenance',   'type' => 'business', 'requires_approval' => true,  'color' => '#f97316'],
                ['name' => 'Professional Services',     'type' => 'business', 'requires_approval' => true,  'color' => '#64748b'],
                ['name' => 'Bank Charges & Taxes',      'type' => 'business', 'requires_approval' => true,  'color' => '#ef4444'],
                ['name' => 'Raw Materials',             'type' => 'business', 'requires_approval' => true,  'color' => '#a855f7'],
                ['name' => 'Miscellaneous',             'type' => 'business', 'requires_approval' => true,  'color' => '#94a3b8'],
                // Personal categories
                ['name' => 'Medical & Health',          'type' => 'personal', 'requires_approval' => true,  'color' => '#22c55e'],
                ['name' => 'Personal Travel',           'type' => 'personal', 'requires_approval' => true,  'color' => '#06b6d4'],
                ['name' => 'Personal Food',             'type' => 'personal', 'requires_approval' => false, 'color' => '#fb923c'],
                ['name' => 'Personal Shopping',         'type' => 'personal', 'requires_approval' => true,  'color' => '#e879f9'],
            ];

            foreach ($categories as $cat) {
                DB::table('expense_categories')->insert(array_merge($cat, [
                    'tenant_id'  => $tenantId,
                    'is_active'  => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        }
    }
}
