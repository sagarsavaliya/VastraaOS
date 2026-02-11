<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class MassDataSeeder extends Seeder
{
    private $faker;
    private $tenantId;
    private $userId;
    
    // Master data IDs
    private $statusIds = [];
    private $priorityIds = [];
    private $itemTypeIds = [];
    private $workTypeIds = [];
    private $occasionIds = [];
    private $sourceIds = [];
    private $budgetIds = [];
    private $measurementTypeIds = [];
    private $zoneIds = [];
    private $workflowStageIds = [];

    public function run(): void
    {
        $this->faker = Faker::create('en_IN');
        
        // Get demo tenant
        $tenant = DB::table('tenants')->where('subdomain', 'demo')->first();
        if (!$tenant) {
            $this->command->error('Demo tenant not found. Please run DemoTenantSeeder first.');
            return;
        }

        $this->tenantId = $tenant->id;
        
        // Get a user for tracking
        $user = DB::table('users')->where('tenant_id', $this->tenantId)->first();
        $this->userId = $user ? $user->id : null;

        $this->loadMasterData();

        // Target Volume
        $numWorkers = 30;
        $numCustomers = 500;
        $numInquiries = 200;
        $numOrders = 2000;

        $this->command->info("Starting FINAL Indian context data seeding (2000 orders)...");

        $this->command->info("Creating workers and skills...");
        $workerIds = $this->createWorkers($numWorkers);

        $this->command->info("Creating customers and measurement profiles...");
        $customerData = $this->createCustomers($numCustomers);
        $customerIds = array_keys($customerData);

        $this->command->info("Creating inquiries...");
        $this->createInquiries($numInquiries, $customerIds);

        $this->command->info("Creating 2000 orders with deep tracking...");
        $this->createOrders($numOrders, $customerData, $workerIds);

        $this->command->info("Massive data seeding completed successfully!");
    }

    private function loadMasterData(): void
    {
        $this->statusIds = DB::table('order_statuses')->where('tenant_id', $this->tenantId)->pluck('id')->toArray();
        $this->priorityIds = DB::table('order_priorities')->where('tenant_id', $this->tenantId)->pluck('id')->toArray();
        $this->itemTypeIds = DB::table('item_types')->where('tenant_id', $this->tenantId)->pluck('id')->toArray();
        $this->workTypeIds = DB::table('work_types')->where('tenant_id', $this->tenantId)->pluck('id')->toArray();
        $this->occasionIds = DB::table('occasions')->where('tenant_id', $this->tenantId)->pluck('id')->toArray();
        $this->sourceIds = DB::table('inquiry_sources')->where('tenant_id', $this->tenantId)->pluck('id')->toArray();
        $this->budgetIds = DB::table('budget_ranges')->where('tenant_id', $this->tenantId)->pluck('id')->toArray();
        $this->measurementTypeIds = DB::table('measurement_types')->where('tenant_id', $this->tenantId)->pluck('id', 'code')->toArray();
        $this->zoneIds = DB::table('embellishment_zones')->where('tenant_id', $this->tenantId)->pluck('id')->toArray();
        $this->workflowStageIds = DB::table('workflow_stages')->where('tenant_id', $this->tenantId)->orderBy('stage_order')->get();
    }

    private function createWorkers(int $count): array
    {
        $workerIds = [];
        for ($i = 0; $i < $count; $i++) {
            $firstName = $this->faker->firstName;
            $lastName = $this->faker->lastName;
            
            $workerId = DB::table('workers')->insertGetId([
                'tenant_id' => $this->tenantId,
                'worker_code' => 'WRK-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'display_name' => $firstName . ' ' . $lastName,
                'mobile' => '9' . $this->faker->numerify('#########'),
                'email' => $this->faker->unique()->safeEmail,
                'rate_type' => 'per_piece',
                'status' => 'active',
                'joined_date' => now()->subMonths(rand(1, 24)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $workerIds[] = $workerId;

            // Worker skills (NO tenant_id)
            $numSkills = rand(1, 4);
            $allWorkTypeIds = $this->workTypeIds;
            shuffle($allWorkTypeIds);
            $skills = array_slice($allWorkTypeIds, 0, min($numSkills, count($allWorkTypeIds)));
            
            foreach ($skills as $workTypeId) {
                DB::table('worker_skills')->insert([
                    'worker_id' => $workerId,
                    'work_type_id' => $workTypeId,
                    'proficiency_level' => $this->faker->randomElement(['beginner', 'intermediate', 'expert']),
                    'rate_per_piece' => rand(200, 2000),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
        return $workerIds;
    }

    private function createCustomers(int $count): array
    {
        $customerData = [];
        for ($i = 0; $i < $count; $i++) {
            $firstName = $this->faker->firstName;
            $lastName = $this->faker->lastName;
            $customerId = DB::table('customers')->insertGetId([
                'tenant_id' => $this->tenantId,
                'customer_code' => 'CUST-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'display_name' => $firstName . ' ' . $lastName,
                'mobile' => '9' . $this->faker->numerify('#########'),
                'gender' => $this->faker->randomElement(['male', 'female']),
                'status' => 'active',
                'created_at' => now()->subDays(rand(1, 365)),
                'updated_at' => now(),
            ]);

            $profileId = DB::table('measurement_profiles')->insertGetId([
                'tenant_id' => $this->tenantId,
                'customer_id' => $customerId,
                'profile_name' => 'Self',
                'is_default' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $customerData[$customerId] = ['profile_id' => $profileId];
        }
        return $customerData;
    }

    private function createInquiries(int $count, array $customerIds): void
    {
        $inquiries = [];
        for ($i = 0; $i < $count; $i++) {
            $inquiries[] = [
                'tenant_id' => $this->tenantId,
                'inquiry_number' => 'INQ-' . date('Y') . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'customer_id' => $this->faker->randomElement($customerIds),
                'source_id' => $this->faker->randomElement($this->sourceIds),
                'occasion_id' => $this->faker->randomElement($this->occasionIds),
                'budget_range_id' => $this->faker->randomElement($this->budgetIds),
                'status' => $this->faker->randomElement(['new', 'contacted', 'appointment_scheduled', 'converted']),
                'requirements' => 'Traditional Indian wedding wear requirements.',
                'created_at' => now()->subDays(rand(1, 45)),
                'updated_at' => now(),
            ];
            
            if (count($inquiries) >= 50) {
                DB::table('customer_inquiries')->insert($inquiries);
                $inquiries = [];
            }
        }
        if (count($inquiries) > 0) {
            DB::table('customer_inquiries')->insert($inquiries);
        }
    }

    private function createOrders(int $count, array $customerData, array $workerIds): void
    {
        $customerIds = array_keys($customerData);
        $fabrics = ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Banarasi', 'Velvet', 'Organza'];
        $neckStyles = ['Round', 'V-Neck', 'Square', 'Boat Neck', 'Collar'];

        $batchSize = 25;
        $batches = ceil($count / $batchSize);

        for ($batch = 0; $batch < $batches; $batch++) {
            DB::beginTransaction();
            try {
                $currentBatchSize = min($batchSize, $count - ($batch * $batchSize));
                for ($i = 0; $i < $currentBatchSize; $i++) {
                    $customerId = $this->faker->randomElement($customerIds);
                    $profileId = $customerData[$customerId]['profile_id'];
                    
                    $orderDate = now()->subDays(rand(1, 180));
                    $subtotal = rand(8000, 75000);
                    $taxAmount = $subtotal * 0.12;
                    $totalAmount = $subtotal + $taxAmount;
                    $amountPaid = $this->faker->randomElement([0, $totalAmount * 0.3, $totalAmount * 0.5, $totalAmount]);
                    
                    // Order (HAS tenant_id)
                    $orderId = DB::table('orders')->insertGetId([
                        'tenant_id' => $this->tenantId,
                        'order_number' => 'ORD-' . str_pad(($batch * $batchSize) + $i + 1, 6, '0', STR_PAD_LEFT),
                        'customer_id' => $customerId,
                        'measurement_profile_id' => $profileId,
                        'status_id' => $this->faker->randomElement($this->statusIds),
                        'priority_id' => $this->faker->randomElement($this->priorityIds),
                        'order_date' => $orderDate,
                        'promised_delivery_date' => (clone $orderDate)->addDays(rand(21, 45)),
                        'subtotal' => $subtotal,
                        'tax_amount' => $taxAmount,
                        'total_amount' => $totalAmount,
                        'amount_paid' => $amountPaid,
                        'amount_pending' => $totalAmount - $amountPaid,
                        'payment_status' => $amountPaid <= 0 ? 'pending' : ($amountPaid < $totalAmount ? 'partial' : 'paid'),
                        'created_at' => $orderDate,
                        'updated_at' => now(),
                    ]);

                    // Measurement Record (HAS tenant_id)
                    $recordId = DB::table('measurement_records')->insertGetId([
                        'tenant_id' => $this->tenantId,
                        'measurement_profile_id' => $profileId,
                        'recorded_date' => $orderDate,
                        'is_latest' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Measurement Values (NO tenant_id)
                    $mValues = [];
                    foreach ($this->measurementTypeIds as $code => $typeId) {
                        $mValues[] = [
                            'measurement_record_id' => $recordId,
                            'measurement_type_id' => $typeId,
                            'value' => rand(30, 45),
                            'unit' => 'inches',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                    DB::table('measurement_values')->insert($mValues);

                    // Order Items (NO tenant_id)
                    $numItems = rand(1, 2);
                    for ($j = 0; $j < $numItems; $j++) {
                        $itemPrice = $subtotal / $numItems;
                        $itemId = DB::table('order_items')->insertGetId([
                            'order_id' => $orderId,
                            'item_type_id' => $this->faker->randomElement($this->itemTypeIds),
                            'quantity' => 1,
                            'unit_price' => $itemPrice,
                            'total_price' => $itemPrice,
                            'status' => 'pending',
                            'assigned_worker_id' => $this->faker->randomElement($workerIds),
                            'created_at' => $orderDate,
                            'updated_at' => now(),
                        ]);

                        // Fabrics (NO tenant_id)
                        DB::table('item_fabrics')->insert([
                            'order_item_id' => $itemId, 
                            'fabric_name' => $this->faker->randomElement($fabrics),
                            'fabric_type' => 'Premium',
                            'quantity_meters' => rand(3, 8),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        
                        // Embellishments (NO tenant_id)
                        $embId = DB::table('item_embellishments')->insertGetId([
                            'order_item_id' => $itemId,
                            'work_type_id' => $this->faker->randomElement($this->workTypeIds),
                            'complexity' => $this->faker->randomElement(['simple', 'moderate', 'complex']),
                            'status' => 'pending',
                            'assigned_worker_id' => $this->faker->randomElement($workerIds),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        // Zones (NO tenant_id)
                        DB::table('item_embellishment_zones')->insert([
                            'item_embellishment_id' => $embId, 
                            'embellishment_zone_id' => $this->faker->randomElement($this->zoneIds),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        // Stitching Specs (NO tenant_id)
                        DB::table('item_stitching_specs')->insert([
                            'order_item_id' => $itemId,
                            'neck_style_front' => $this->faker->randomElement($neckStyles),
                            'stitching_cost' => rand(1500, 5000),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        // Workflow Tasks (NO tenant_id)
                        $tasks = [];
                        foreach ($this->workflowStageIds->take(rand(5, 12)) as $stage) {
                            $tasks[] = [
                                'order_id' => $orderId,
                                'order_item_id' => $itemId,
                                'workflow_stage_id' => $stage->id,
                                'status' => 'pending',
                                'assigned_to_worker_id' => $this->faker->randomElement($workerIds),
                                'due_date' => (clone $orderDate)->addDays($stage->stage_order * 2),
                                'created_at' => $orderDate,
                                'updated_at' => now(),
                            ];
                        }
                        DB::table('order_workflow_tasks')->insert($tasks);
                    }

                    // Payment Summary (NO tenant_id)
                    DB::table('order_payment_summary')->insert([
                        'order_id' => $orderId,
                        'total_order_amount' => $totalAmount,
                        'total_paid_amount' => $amountPaid,
                        'pending_amount' => $totalAmount - $amountPaid,
                        'advance_amount' => $amountPaid > 0 ? $amountPaid * 0.5 : 0,
                        'created_at' => $orderDate,
                        'updated_at' => now(),
                    ]);

                    // Single Payment record (HAS tenant_id)
                    if ($amountPaid > 0) {
                        DB::table('payments')->insert([
                            'tenant_id' => $this->tenantId,
                            'payment_number' => 'PAY-' . str_pad($orderId, 6, '0', STR_PAD_LEFT),
                            'order_id' => $orderId,
                            'customer_id' => $customerId,
                            'amount' => $amountPaid,
                            'payment_date' => $orderDate,
                            'payment_mode' => $this->faker->randomElement(['cash', 'upi', 'bank_transfer']),
                            'status' => 'completed',
                            'created_at' => $orderDate,
                            'updated_at' => now(),
                        ]);
                    }
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->command->error("Batch {$batch} failed: " . $e->getMessage());
                throw $e;
            }
            if (($batch + 1) % 10 == 0 || $batch == 0) {
                $this->command->info("  Batch " . ($batch + 1) . "/{$batches} completed");
            }
        }
    }
}
