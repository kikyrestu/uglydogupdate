<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
Task::create([
            'judul' => 'Follow akun Twitter',
            'deskripsi' => 'Follow akun resmi di Twitter',
            'tipe' => 'once', // atau daily, weekly, season
            'score' => 50,
            'status' => true,
        ]);

        Task::create([
            'judul' => 'Join grup Telegram',
            'deskripsi' => 'Join komunitas di Telegram',
            'tipe' => 'once',
            'score' => 50,
            'status' => true,
        ]);

        Task::create([
            'judul' => 'Login harian',
            'deskripsi' => 'Dapatkan skor dengan login setiap hari',
            'tipe' => 'daily',
            'score' => 10,
            'status' => true,
        ]);
    }
}
