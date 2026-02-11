<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Perfect for getting started with basic order management.',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'currency' => 'INR',
                'features' => json_encode([
                    'max_users' => 1,
                    'max_orders_per_month' => 50,
                    'max_customers' => 100,
                    'basic_reports' => true,
                    'gst_invoicing' => false,
                    'workflow_management' => true,
                    'api_access' => false,
                    'priority_support' => false,
                    'white_label' => false,
                ]),
                'limits' => json_encode([
                    'storage_mb' => 500,
                    'api_calls_per_month' => 0,
                ]),
                'is_active' => true,
                'is_featured' => false,
                'trial_days' => 0,
                'display_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Ideal for small boutiques and growing businesses.',
                'price_monthly' => 999,
                'price_yearly' => 9990,
                'currency' => 'INR',
                'features' => json_encode([
                    'max_users' => 3,
                    'max_orders_per_month' => 200,
                    'max_customers' => 500,
                    'basic_reports' => true,
                    'advanced_reports' => false,
                    'gst_invoicing' => true,
                    'workflow_management' => true,
                    'api_access' => false,
                    'priority_support' => false,
                    'white_label' => false,
                ]),
                'limits' => json_encode([
                    'storage_mb' => 2048,
                    'api_calls_per_month' => 0,
                ]),
                'is_active' => true,
                'is_featured' => false,
                'trial_days' => 14,
                'display_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'For established businesses with advanced needs.',
                'price_monthly' => 2499,
                'price_yearly' => 24990,
                'currency' => 'INR',
                'features' => json_encode([
                    'max_users' => 10,
                    'max_orders_per_month' => -1, // Unlimited
                    'max_customers' => -1,
                    'basic_reports' => true,
                    'advanced_reports' => true,
                    'gst_invoicing' => true,
                    'workflow_management' => true,
                    'api_access' => true,
                    'priority_support' => false,
                    'white_label' => false,
                    'custom_workflow' => true,
                ]),
                'limits' => json_encode([
                    'storage_mb' => 10240,
                    'api_calls_per_month' => 10000,
                ]),
                'is_active' => true,
                'is_featured' => true,
                'trial_days' => 14,
                'display_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Complete solution for large-scale operations.',
                'price_monthly' => 4999,
                'price_yearly' => 49990,
                'currency' => 'INR',
                'features' => json_encode([
                    'max_users' => -1, // Unlimited
                    'max_orders_per_month' => -1,
                    'max_customers' => -1,
                    'basic_reports' => true,
                    'advanced_reports' => true,
                    'gst_invoicing' => true,
                    'workflow_management' => true,
                    'api_access' => true,
                    'priority_support' => true,
                    'white_label' => true,
                    'custom_workflow' => true,
                    'dedicated_support' => true,
                    'custom_integrations' => true,
                ]),
                'limits' => json_encode([
                    'storage_mb' => -1, // Unlimited
                    'api_calls_per_month' => -1,
                ]),
                'is_active' => true,
                'is_featured' => false,
                'trial_days' => 30,
                'display_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('subscription_plans')->insert($plans);
    }
}
