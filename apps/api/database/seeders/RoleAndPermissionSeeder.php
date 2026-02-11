<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions by module
        $permissions = [
            // Dashboard
            'dashboard.view',

            // Customers
            'customers.view',
            'customers.create',
            'customers.edit',
            'customers.delete',
            'customers.export',

            // Inquiries
            'inquiries.view',
            'inquiries.create',
            'inquiries.edit',
            'inquiries.delete',
            'inquiries.convert',

            // Measurements
            'measurements.view',
            'measurements.create',
            'measurements.edit',
            'measurements.delete',

            // Orders
            'orders.view',
            'orders.create',
            'orders.edit',
            'orders.delete',
            'orders.cancel',
            'orders.view_cost', // Owner only - cost estimation
            'orders.edit_cost',

            // Workflow
            'workflow.view',
            'workflow.update',
            'workflow.assign',

            // Workers
            'workers.view',
            'workers.create',
            'workers.edit',
            'workers.delete',
            'workers.assign',

            // Invoices
            'invoices.view',
            'invoices.create',
            'invoices.edit',
            'invoices.delete',
            'invoices.download',

            // Payments
            'payments.view',
            'payments.create',
            'payments.edit',
            'payments.delete',

            // Reports
            'reports.view',
            'reports.revenue',
            'reports.gst',
            'reports.export',

            // Settings
            'settings.view',
            'settings.edit',
            'settings.master_data',

            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Tenant/Subscription
            'tenant.view',
            'tenant.edit',
            'subscription.view',
            'subscription.manage',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // Create roles and assign permissions
        // Owner - Full access
        $ownerRole = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'api']);
        $ownerRole->givePermissionTo(Permission::all());

        // Manager - Most access except sensitive operations
        $managerRole = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'api']);
        $managerPermissions = [
            'dashboard.view',
            'customers.view', 'customers.create', 'customers.edit', 'customers.export',
            'inquiries.view', 'inquiries.create', 'inquiries.edit', 'inquiries.convert',
            'measurements.view', 'measurements.create', 'measurements.edit',
            'orders.view', 'orders.create', 'orders.edit', 'orders.cancel',
            'workflow.view', 'workflow.update', 'workflow.assign',
            'workers.view', 'workers.create', 'workers.edit', 'workers.assign',
            'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.download',
            'payments.view', 'payments.create', 'payments.edit',
            'reports.view', 'reports.revenue', 'reports.gst', 'reports.export',
            'settings.view', 'settings.master_data',
            'users.view',
        ];
        $managerRole->givePermissionTo($managerPermissions);

        // Staff - Limited access
        $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'api']);
        $staffPermissions = [
            'dashboard.view',
            'customers.view', 'customers.create', 'customers.edit',
            'inquiries.view', 'inquiries.create', 'inquiries.edit',
            'measurements.view', 'measurements.create', 'measurements.edit',
            'orders.view', 'orders.create', 'orders.edit',
            'workflow.view', 'workflow.update',
            'workers.view',
            'invoices.view', 'invoices.download',
            'payments.view', 'payments.create',
            'users.view',
        ];
        $staffRole->givePermissionTo($staffPermissions);

        // Super Admin role (for platform admins)
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'api']);
        // Super admin bypasses all permissions via Gate::before in AuthServiceProvider
    }
}
