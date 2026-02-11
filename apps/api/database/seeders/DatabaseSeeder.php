<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Subscription Plans (required before tenants)
            SubscriptionPlanSeeder::class,

            // 2. Theme Presets (required before tenant theme settings)
            ThemePresetSeeder::class,

            // 3. Roles and Permissions (required before users)
            RoleAndPermissionSeeder::class,

            // 4. Super Admin User
            SuperAdminSeeder::class,

            // 5. Demo Tenant with all master data
            DemoTenantSeeder::class,
        ]);
    }
}
