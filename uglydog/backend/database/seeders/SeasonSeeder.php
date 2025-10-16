<?php

namespace Database\Seeders;

use App\Models\Season;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SeasonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Season::create([
            'nama' => 'Season 1',
            'mulai' => now(),
            'selesai' => now()->addDays(14),
            'aktif' => true,
        ]);

        Season::create([
            'nama' => 'Season 2',
            'mulai' => now()->addDays(15),
            'selesai' => now()->addDays(28),
        ]);
    }
}
