<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create super admin user (no tenant association)
        DB::table('users')->insert([
            'tenant_id' => null,
            'name' => 'Super Admin',
            'email' => 'superuser@vastraaos.com',
            'password' => Hash::make('super@128'),
            'mobile' => '8141302341',
            'is_super_admin' => true,
            'is_active' => true,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
