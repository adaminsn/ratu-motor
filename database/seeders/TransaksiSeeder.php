<?php

namespace Database\Seeders;

use App\Models\Transaksi;
use App\Models\Motor;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class TransaksiSeeder extends Seeder
{
    public function run()
    {
        $user = User::where('email', 'dwi@ratumotor.test')->first();

        if (!$user) {
            $user = User::first();
        }

        // Ambil motor yang statusnya tersedia untuk transaksi pertama
        $motor1 = Motor::where('status', 'tersedia')->first();
        if ($motor1) {
            $customer1 = Customer::firstOrCreate(
                ['no_hp' => '081234567890'],
                [
                    'nama' => 'Budi Santoso',
                    'alamat' => 'Jl. Mawar No. 10, Banyuwangi',
                ]
            );

            Transaksi::create([
                'motor_id' => $motor1->id,
                'user_id' => $user->id,
                'customer_id' => $customer1->id,
                'tanggal_transaksi' => now()->subDays(7),
                'harga_kesepakatan' => $motor1->harga_jual - 500000,
                'metode_pembayaran' => 'tunai',
                'status_pembayaran' => 'lunas',
                'keterangan' => 'Transaksi pertama'
            ]);
            // Update status motor menjadi terjual
            $motor1->update(['status' => 'terjual']);
        }

        // Ambil motor lain untuk transaksi kedua
        $motor2 = Motor::where('status', 'tersedia')->skip(1)->first();
        if ($motor2) {
            $customer2 = Customer::firstOrCreate(
                ['no_hp' => '081234567891'],
                [
                    'nama' => 'Siti Rahayu',
                    'alamat' => 'Jl. Melati No. 5, Banyuwangi',
                ]
            );

            Transaksi::create([
                'motor_id' => $motor2->id,
                'user_id' => $user->id,
                'customer_id' => $customer2->id,
                'tanggal_transaksi' => now()->subDays(3),
                'harga_kesepakatan' => $motor2->harga_jual - 1000000,
                'metode_pembayaran' => 'kredit',
                'status_pembayaran' => 'pending',
                'keterangan' => 'Transaksi kredit'
            ]);
            $motor2->update(['status' => 'terjual']);
        }

        $this->command->info('✅ Data transaksi dummy berhasil dibuat!');
    }
}