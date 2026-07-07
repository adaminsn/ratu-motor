<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(RoleSeeder::class);
        // Dihapus agar tidak menghasilkan data dummy selain role/user
        // $this->call(MotorSeeder::class);
        // $this->call(KeuanganSeeder::class);
        // $this->call(TransaksiSeeder::class);
    }
}