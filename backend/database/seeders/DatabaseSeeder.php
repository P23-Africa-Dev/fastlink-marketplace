<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Local demo users (password for all: "password").
     */
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@fastlink.test'],
            [
                'name' => 'Fastlink Admin',
                'password' => 'password',
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $seller = User::query()->updateOrCreate(
            ['email' => 'seller@fastlink.test'],
            [
                'name' => 'Demo Seller',
                'password' => 'password',
                'role' => 'seller',
                'status' => 'active',
                'phone' => '08012345678',
            ]
        );

        $buyer = User::query()->updateOrCreate(
            ['email' => 'buyer@fastlink.test'],
            [
                'name' => 'Demo Buyer',
                'password' => 'password',
                'role' => 'buyer',
                'status' => 'active',
            ]
        );

        Store::query()->updateOrCreate(
            ['owner_id' => $seller->id],
            [
                'name' => 'Demo Seller Store',
                'slug' => 'demo-seller-store',
                'phone' => '08012345678',
                'bank_name' => 'GTBank',
                'bank_account_number' => '0123456789',
                'bank_account_name' => 'Demo Seller',
                'status' => 'approved',
            ]
        );

        unset($admin, $buyer);
    }
}
