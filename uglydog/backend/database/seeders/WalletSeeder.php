<?php

namespace Database\Seeders;

use App\Models\Wallet;
use App\Models\Pengguna;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class WalletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Wallet::create([
            'pengguna_id' => Pengguna::first()->id,
            'provider' => 'phantom',
            'address' => '0x123456789abcdef123456789abcdef1234567890',
        ]);
    }
}
