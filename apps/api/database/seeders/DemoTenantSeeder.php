<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoTenantSeeder extends Seeder
{
    public function run(): void
    {
        // Get the Professional plan
        $plan = DB::table('subscription_plans')->where('slug', 'professional')->first();

        // Create demo tenant
        $tenantId = DB::table('tenants')->insertGetId([
            'uuid' => Str::uuid(),
            'business_name' => 'Naari Arts Demo',
            'display_name' => 'Naari Arts',
            'subdomain' => 'demo',
            'email' => 'demo@naariarts.com',
            'mobile' => '9876543210',
            'address' => '123 Fashion Street, Textile Market',
            'city' => 'Ahmedabad',
            'state' => 'Gujarat',
            'state_code' => '24',
            'pincode' => '380001',
            'status' => 'active',
            'onboarding_completed' => true,
            'onboarding_step' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create subscription for demo tenant
        DB::table('tenant_subscriptions')->insert([
            'tenant_id' => $tenantId,
            'plan_id' => $plan->id,
            'status' => 'active',
            'billing_cycle' => 'yearly',
            'current_period_start' => now(),
            'current_period_end' => now()->addYear(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create tenant settings
        DB::table('tenant_settings')->insert([
            'tenant_id' => $tenantId,
            'gst_module_enabled' => true,
            'gst_number' => '24AABCU9603R1ZM',
            'gst_registered_name' => 'Naari Arts Demo',
            'hidden_gst_percentage' => 0,
            'gst_invoice_prefix' => 'GST',
            'non_gst_invoice_prefix' => 'INV',
            'order_prefix' => 'ORD',
            'financial_year_start' => 4,
            'enable_itc_tracking' => false,
            'currency' => 'INR',
            'timezone' => 'Asia/Kolkata',
            'measurement_unit' => 'inches',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create theme settings
        $themePreset = DB::table('theme_presets')->where('slug', 'naari-default')->first();
        DB::table('tenant_theme_settings')->insert([
            'tenant_id' => $tenantId,
            'theme_preset_id' => $themePreset->id,
            'sidebar_style' => 'default',
            'sidebar_position' => 'left',
            'navbar_style' => 'default',
            'enable_dark_mode' => true,
            'default_mode' => 'light',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create demo owner user
        $ownerId = DB::table('users')->insertGetId([
            'tenant_id' => $tenantId,
            'name' => 'Demo Owner',
            'email' => 'owner@demo.naariarts.com',
            'password' => Hash::make('demo@123'),
            'mobile' => '9876543211',
            'is_super_admin' => false,
            'is_active' => true,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create demo manager user
        $managerId = DB::table('users')->insertGetId([
            'tenant_id' => $tenantId,
            'name' => 'Demo Manager',
            'email' => 'manager@demo.naariarts.com',
            'password' => Hash::make('demo@123'),
            'mobile' => '9876543212',
            'is_super_admin' => false,
            'is_active' => true,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create demo staff user
        $staffId = DB::table('users')->insertGetId([
            'tenant_id' => $tenantId,
            'name' => 'Demo Staff',
            'email' => 'staff@demo.naariarts.com',
            'password' => Hash::make('demo@123'),
            'mobile' => '9876543213',
            'is_super_admin' => false,
            'is_active' => true,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Assign roles using Spatie
        // Note: This will be done after the model is created
        // For now, we'll use model_has_roles table directly
        $ownerRole = DB::table('roles')->where('name', 'owner')->first();
        $managerRole = DB::table('roles')->where('name', 'manager')->first();
        $staffRole = DB::table('roles')->where('name', 'staff')->first();

        if ($ownerRole) {
            DB::table('model_has_roles')->insert([
                'role_id' => $ownerRole->id,
                'model_type' => 'App\\Models\\User',
                'model_id' => $ownerId,
            ]);
        }

        if ($managerRole) {
            DB::table('model_has_roles')->insert([
                'role_id' => $managerRole->id,
                'model_type' => 'App\\Models\\User',
                'model_id' => $managerId,
            ]);
        }

        if ($staffRole) {
            DB::table('model_has_roles')->insert([
                'role_id' => $staffRole->id,
                'model_type' => 'App\\Models\\User',
                'model_id' => $staffId,
            ]);
        }

        // Seed master data for demo tenant
        $this->seedMasterData($tenantId);
    }

    private function seedMasterData(int $tenantId): void
    {
        // Item Types
        foreach (MasterDataSeeder::getDefaultItemTypes() as $item) {
            DB::table('item_types')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Work Types
        foreach (MasterDataSeeder::getDefaultWorkTypes() as $item) {
            DB::table('work_types')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Embellishment Zones
        foreach (MasterDataSeeder::getDefaultEmbellishmentZones() as $item) {
            DB::table('embellishment_zones')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Inquiry Sources
        foreach (MasterDataSeeder::getDefaultInquirySources() as $item) {
            DB::table('inquiry_sources')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Occasions
        foreach (MasterDataSeeder::getDefaultOccasions() as $item) {
            DB::table('occasions')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Budget Ranges
        foreach (MasterDataSeeder::getDefaultBudgetRanges() as $item) {
            DB::table('budget_ranges')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'currency' => 'INR',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Measurement Types
        foreach (MasterDataSeeder::getDefaultMeasurementTypes() as $item) {
            DB::table('measurement_types')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Workflow Stages
        foreach (WorkflowStageSeeder::getDefaultStages() as $item) {
            DB::table('workflow_stages')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Order Statuses
        foreach (MasterDataSeeder::getDefaultOrderStatuses() as $item) {
            DB::table('order_statuses')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Order Priorities
        foreach (MasterDataSeeder::getDefaultOrderPriorities() as $item) {
            DB::table('order_priorities')->insert(array_merge($item, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Order Number Sequences
        $sequences = ['order', 'invoice_gst', 'invoice_non_gst', 'inquiry', 'customer', 'worker', 'payment'];
        $prefixes = ['ORD-', 'GST-', 'INV-', 'INQ-', 'CUST-', 'WRK-', 'PAY-'];

        foreach ($sequences as $index => $type) {
            DB::table('order_number_sequences')->insert([
                'tenant_id' => $tenantId,
                'sequence_type' => $type,
                'prefix' => $prefixes[$index],
                'current_number' => 0,
                'padding_length' => 4,
                'fiscal_year' => date('Y') . '-' . (date('Y') + 1),
                'reset_yearly' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
