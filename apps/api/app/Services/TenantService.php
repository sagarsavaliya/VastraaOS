<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantSetting;
use App\Models\TenantSubscription;
use Database\Seeders\MasterDataSeeder;
use Database\Seeders\WorkflowStageSeeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TenantService
{
    /**
     * Initialize a new tenant with default settings and master data
     */
    public function initializeNewTenant(Tenant $tenant): void
    {
        DB::transaction(function () use ($tenant) {
            $this->createDefaultSettings($tenant);
            $this->seedMasterData($tenant);
            $this->createDefaultSubscription($tenant);
        });
    }

    /**
     * Create default settings for a tenant
     */
    public function createDefaultSettings(Tenant $tenant): void
    {
        TenantSetting::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'currency' => 'INR',
                'timezone' => 'Asia/Kolkata',
                'measurement_unit' => 'inches',
                'financial_year_start' => 4,
            ]
        );
    }

    /**
     * Seed default master data for a tenant
     */
    public function seedMasterData(Tenant $tenant): void
    {
        $tenantId = $tenant->id;

        $masterData = [
            'item_types' => MasterDataSeeder::getDefaultItemTypes(),
            'work_types' => MasterDataSeeder::getDefaultWorkTypes(),
            'embellishment_zones' => MasterDataSeeder::getDefaultEmbellishmentZones(),
            'inquiry_sources' => MasterDataSeeder::getDefaultInquirySources(),
            'occasions' => MasterDataSeeder::getDefaultOccasions(),
            'budget_ranges' => MasterDataSeeder::getDefaultBudgetRanges(),
            'measurement_types' => MasterDataSeeder::getDefaultMeasurementTypes(),
            'order_statuses' => MasterDataSeeder::getDefaultOrderStatuses(),
            'order_priorities' => MasterDataSeeder::getDefaultOrderPriorities(),
        ];

        foreach ($masterData as $table => $items) {
            foreach ($items as $item) {
                $data = array_merge($item, [
                    'tenant_id' => $tenantId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($table === 'budget_ranges') {
                    $data['currency'] = 'INR';
                }

                DB::table($table)->insert($data);
            }
        }

        // Seed workflow stages
        foreach (WorkflowStageSeeder::getDefaultStages() as $stage) {
            DB::table('workflow_stages')->insert(array_merge($stage, [
                'tenant_id' => $tenantId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed number sequences
        $this->seedNumberSequences($tenantId);
    }

    /**
     * Create default trial subscription
     */
    public function createDefaultSubscription(Tenant $tenant): void
    {
        // Check if subscription already exists
        if ($tenant->subscription()->exists()) {
            return;
        }

        $starterPlan = DB::table('subscription_plans')->where('slug', 'starter')->first() 
                      ?? DB::table('subscription_plans')->where('slug', 'free')->first();

        if ($starterPlan) {
            TenantSubscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $starterPlan->id,
                'status' => 'trialing',
                'billing_cycle' => 'monthly',
                'current_period_start' => Carbon::now(),
                'current_period_end' => Carbon::now()->addDays($starterPlan->trial_days ?? 14),
                'trial_ends_at' => Carbon::now()->addDays($starterPlan->trial_days ?? 14),
            ]);
        }
    }

    /**
     * Seed initial number sequences
     */
    private function seedNumberSequences(int $tenantId): void
    {
        $sequences = [
            ['sequence_type' => 'order', 'prefix' => 'ORD-'],
            ['sequence_type' => 'invoice_gst', 'prefix' => 'GST-'],
            ['sequence_type' => 'invoice_non_gst', 'prefix' => 'INV-'],
            ['sequence_type' => 'inquiry', 'prefix' => 'INQ-'],
            ['sequence_type' => 'customer', 'prefix' => 'CUST-'],
            ['sequence_type' => 'worker', 'prefix' => 'WRK-'],
            ['sequence_type' => 'payment', 'prefix' => 'PAY-'],
        ];

        $fiscalYear = $this->getCurrentFiscalYear();

        foreach ($sequences as $seq) {
            DB::table('order_number_sequences')->insert([
                'tenant_id' => $tenantId,
                'sequence_type' => $seq['sequence_type'],
                'prefix' => $seq['prefix'],
                'current_number' => 0,
                'padding_length' => 4,
                'fiscal_year' => $fiscalYear,
                'reset_yearly' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Get current fiscal year string
     */
    private function getCurrentFiscalYear(): string
    {
        $month = (int) date('n');
        $year = (int) date('Y');

        if ($month < 4) {
            return ($year - 1) . '-' . substr($year, 2);
        }

        return $year . '-' . substr($year + 1, 2);
    }
}
