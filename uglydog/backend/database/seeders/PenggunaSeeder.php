<?php

namespace Database\Seeders;

use App\Models\Pengguna;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PenggunaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Pengguna::create([
            'name' => 'Eko Bagus',
            'email' => 'kaguyachi@outlook.com',
            'password' => bcrypt('password'),
        ]);

        Pengguna::create([
            'name' => 'Wafi',
            'email' => 'wafi@gmail.com',
            'password' => bcrypt('password'),
        ]);

        Pengguna::create([
            'name' => 'Kiky',
            'email' => 'kiky@gmail.com',
            'password' => bcrypt('password'),
        ]);

        Pengguna::create([
            'name' => 'Lutfi',
            'email' => 'lutfi@gmail.com',
            'password' => bcrypt('password'),
        ]);
    }
}
