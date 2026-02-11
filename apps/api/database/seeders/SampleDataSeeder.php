<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // Get demo tenant
        $tenant = DB::table('tenants')->where('subdomain', 'demo')->first();
        if (!$tenant) {
            $this->command->error('Demo tenant not found. Please run DemoTenantSeeder first.');
            return;
        }

        $tenantId = $tenant->id;

        // Cleanup existing sample data to avoid unique constraints
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('order_workflow_tasks')->where('tenant_id', $tenantId)->delete();
        DB::table('order_items')->where('tenant_id', $tenantId)->delete();
        
        // Correctly delete payment summaries for the tenant's orders
        DB::table('order_payment_summary')->whereIn('order_id', function ($query) use ($tenantId) {
            $query->select('id')->from('orders')->where('tenant_id', $tenantId);
        })->delete();

        DB::table('payments')->where('tenant_id', $tenantId)->delete();
        DB::table('invoices')->where('tenant_id', $tenantId)->delete();
        DB::table('orders')->where('tenant_id', $tenantId)->delete();
        DB::table('customers')->where('tenant_id', $tenantId)->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Get master data IDs
        $statuses = DB::table('order_statuses')->where('tenant_id', $tenantId)->get()->keyBy('slug');
        $priorities = DB::table('order_priorities')->where('tenant_id', $tenantId)->get()->keyBy('slug');
        $itemTypes = DB::table('item_types')->where('tenant_id', $tenantId)->get();

        // Create sample customers
        $customers = $this->createCustomers($tenantId);

        // Get workflow stages for task creation
        $stages = DB::table('workflow_stages')
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('stage_order')
            ->get();

        // Create sample orders
        $this->createOrders($tenantId, $customers, $statuses, $priorities, $itemTypes, $stages);

        $this->command->info('Sample data seeded successfully!');
    }

    private function createCustomers(int $tenantId): array
    {
        $customerNames = [
            ['first_name' => 'Priya', 'last_name' => 'Sharma', 'mobile' => '9876543210', 'email' => 'priya.sharma@example.com'],
            ['first_name' => 'Anjali', 'last_name' => 'Patel', 'mobile' => '9876543211', 'email' => 'anjali.patel@example.com'],
            ['first_name' => 'Neha', 'last_name' => 'Gupta', 'mobile' => '9876543212', 'email' => 'neha.gupta@example.com'],
            ['first_name' => 'Kavita', 'last_name' => 'Singh', 'mobile' => '9876543213', 'email' => 'kavita.singh@example.com'],
            ['first_name' => 'Rani', 'last_name' => 'Desai', 'mobile' => '9876543214', 'email' => 'rani.desai@example.com'],
            ['first_name' => 'Meera', 'last_name' => 'Joshi', 'mobile' => '9876543215', 'email' => 'meera.joshi@example.com'],
            ['first_name' => 'Sita', 'last_name' => 'Reddy', 'mobile' => '9876543216', 'email' => 'sita.reddy@example.com'],
            ['first_name' => 'Lakshmi', 'last_name' => 'Iyer', 'mobile' => '9876543217', 'email' => 'lakshmi.iyer@example.com'],
            ['first_name' => 'Radha', 'last_name' => 'Nair', 'mobile' => '9876543218', 'email' => 'radha.nair@example.com'],
            ['first_name' => 'Gita', 'last_name' => 'Verma', 'mobile' => '9876543219', 'email' => 'gita.verma@example.com'],
        ];

        $customerIds = [];
        foreach ($customerNames as $index => $customer) {
            $customerIds[] = DB::table('customers')->insertGetId([
                'tenant_id' => $tenantId,
                'customer_code' => 'CUST-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'first_name' => $customer['first_name'],
                'last_name' => $customer['last_name'],
                'display_name' => $customer['first_name'] . ' ' . $customer['last_name'],
                'mobile' => $customer['mobile'],
                'email' => $customer['email'],
                'address' => 'Address ' . ($index + 1) . ', Textile Market',
                'city' => 'Ahmedabad',
                'state' => 'Gujarat',
                'pincode' => '380001',
                'customer_type' => 'individual',
                'status' => 'active',
                'created_at' => now()->subDays(rand(30, 90)),
                'updated_at' => now(),
            ]);
        }

        return $customerIds;
    }

    private function createOrders(int $tenantId, array $customerIds, $statuses, $priorities, $itemTypes, $stages): void
    {
        $statusArray = $statuses->toArray();
        $priorityArray = $priorities->toArray();
        $itemTypesArray = $itemTypes->toArray();

        // Create 25 orders with varying dates
        for ($i = 1; $i <= 25; $i++) {
            $customerId = $customerIds[array_rand($customerIds)];
            
            // Get random status and priority
            $status = $statusArray[array_rand($statusArray)];
            $priority = $priorityArray[array_rand($priorityArray)];

            // Vary order dates
            $orderDate = now()->subDays(rand(1, 60));
            $deliveryDate = (clone $orderDate)->addDays(rand(7, 30));

            // Calculate amounts
            $baseAmount = rand(5000, 50000);
            $advanceAmount = $baseAmount * (rand(20, 50) / 100);
            $balanceAmount = $baseAmount - $advanceAmount;

            $orderId = DB::table('orders')->insertGetId([
                'tenant_id' => $tenantId,
                'customer_id' => $customerId,
                'order_number' => 'ORD-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'order_date' => $orderDate,
                'promised_delivery_date' => $deliveryDate,
                'status_id' => $status->id,
                'priority_id' => $priority->id,
                'subtotal' => $baseAmount,
                'total_amount' => $baseAmount,
                'amount_paid' => $advanceAmount,
                'amount_pending' => $balanceAmount,
                'internal_notes' => 'Sample order ' . $i,
                'created_at' => $orderDate,
                'updated_at' => now(),
            ]);

            // Create order items
            $numItems = rand(1, 3);
            for ($j = 0; $j < $numItems; $j++) {
                $itemType = $itemTypesArray[array_rand($itemTypesArray)];
                $itemAmount = rand(2000, 15000);

                $itemId = DB::table('order_items')->insertGetId([
                    'tenant_id' => $tenantId,
                    'order_id' => $orderId,
                    'item_type_id' => $itemType->id,
                    'quantity' => rand(1, 3),
                    'unit_price' => $itemAmount,
                    'total_price' => $itemAmount,
                    'description' => 'Sample item for ' . $itemType->name,
                    'created_at' => $orderDate,
                    'updated_at' => now(),
                ]);

                // Create workflow tasks for each item
                foreach ($stages as $stage) {
                    DB::table('order_workflow_tasks')->insert([
                        'tenant_id' => $tenantId,
                        'order_id' => $orderId,
                        'order_item_id' => $itemId,
                        'workflow_stage_id' => $stage->id,
                        'status' => $j == 0 && $stage->stage_order == 1 ? 'in_progress' : 'pending',
                        'created_at' => $orderDate,
                        'updated_at' => now(),
                    ]);
                }
            }

            // Create payment summary
            DB::table('order_payment_summary')->insert([
                'order_id' => $orderId,
                'total_order_amount' => $baseAmount,
                'total_paid_amount' => $advanceAmount,
                'pending_amount' => $balanceAmount,
                'advance_amount' => $advanceAmount,
                'created_at' => $orderDate,
                'updated_at' => now(),
            ]);

            // Create advance payment if there is one
            if ($advanceAmount > 0) {
                $paymentId = DB::table('payments')->insertGetId([
                    'tenant_id' => $tenantId,
                    'order_id' => $orderId,
                    'customer_id' => $customerId,
                    'payment_number' => 'PAY-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'payment_date' => $orderDate,
                    'amount' => $advanceAmount,
                    'payment_mode' => ['cash', 'upi', 'bank_transfer'][array_rand(['cash', 'upi', 'bank_transfer'])],
                    'status' => 'completed',
                    'notes' => 'Advance payment',
                    'created_at' => $orderDate,
                    'updated_at' => now(),
                ]);
            }

            // Create invoice for some orders
            if (rand(0, 1)) {
                DB::table('invoices')->insert([
                    'tenant_id' => $tenantId,
                    'order_id' => $orderId,
                    'customer_id' => $customerId,
                    'invoice_number' => 'INV-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'invoice_date' => $orderDate,
                    'invoice_type' => 'non_gst',
                    
                    // Required billing/seller info
                    'billing_name' => 'Sample Customer',
                    'seller_name' => 'Vastraa Demo Shop',
                    
                    'subtotal' => $baseAmount,
                    'taxable_amount' => $baseAmount,
                    'total_amount' => $baseAmount,
                    'grand_total' => $baseAmount,
                    'amount_paid' => $advanceAmount,
                    'amount_pending' => $balanceAmount,
                    'status' => $balanceAmount > 0 ? 'sent' : 'paid',
                    'created_at' => $orderDate,
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
