<?php

namespace Database\Seeders;

use App\Models\Motor;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Transaksi;
use App\Models\Booking;
use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use App\Models\Servis;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('📊 Mulai membuat data dummy...');

        // ===== 1. BUAT SUPPLIER =====
        $suppliers = [];
        for ($i = 1; $i <= 5; $i++) {
            $suppliers[] = Supplier::create([
                'nama' => 'Supplier ' . chr(64 + $i),
                'no_hp' => '0812' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
                'alamat' => 'Jl. Supplier No. ' . $i . ', Banyuwangi',
                'keterangan' => 'Supplier ' . ['Utama', 'Motor Baru', 'Motor Bekas', 'Sparepart', 'Aksesoris'][$i - 1],
            ]);
        }

        // ===== 2. BUAT CUSTOMER =====
        $customers = [];
        for ($i = 1; $i <= 20; $i++) {
            $customers[] = Customer::create([
                'nama' => 'Customer ' . $i,
                'no_hp' => '0813' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
                'alamat' => 'Jl. Customer No. ' . $i . ', Banyuwangi',
                'nik' => str_pad(rand(1000000000000000, 9999999999999999), 16, '0', STR_PAD_LEFT),
            ]);
        }

        // ===== 3. BUAT USER =====
        $adminUser = User::where('email', 'afrisal@ratumotor.test')->first();
        if (!$adminUser) {
            $adminUser = User::create([
                'name' => 'Admin Ratu Motor',
                'email' => 'afrisal@ratumotor.test',
                'password' => bcrypt('password'),
                'type' => 'admin',
                'no_hp' => '081234567891'
            ]);
            $adminUser->assignRole('admin');
        }

        // ===== 4. BUAT 50 MOTOR =====
        $merkList = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'TVS'];
        $tipeList = [
            'Honda' => ['Beat', 'Vario 125', 'Vario 160', 'PCX', 'Scoopy', 'CBR150R', 'CRF150'],
            'Yamaha' => ['NMAX', 'Aerox', 'Mio', 'Fazzio', 'R25', 'XSR', 'Lexi'],
            'Suzuki' => ['Nex II', 'Address', 'Satria F150', 'GSX-R150', 'Raider'],
            'Kawasaki' => ['W175', 'KLX 150', 'Ninja 250', 'Z250'],
            'TVS' => ['Apache', 'Ntorq', 'Dazz', 'Scooty'],
        ];
        $warnaList = ['Hitam', 'Putih', 'Merah', 'Biru', 'Silver', 'Krem', 'Hijau', 'Orange', 'Abu-abu', 'Coklat'];
        $kondisiList = ['baru', 'bekas'];

        $motors = [];

        for ($i = 1; $i <= 50; $i++) {
            $merk = $merkList[array_rand($merkList)];
            $tipeArray = $tipeList[$merk] ?? ['Generic'];
            $tipe = $tipeArray[array_rand($tipeArray)];
            $tahun = rand(2020, 2025);
            $warna = $warnaList[array_rand($warnaList)];
            $kondisi = $kondisiList[array_rand($kondisiList)];
            
            if ($i <= 30) {
                $status = 'tersedia';
            } elseif ($i <= 45) {
                $status = 'reserved';
            } else {
                $status = 'terjual';
            }

            $hargaBeli = rand(8000000, 30000000);
            $hargaJual = $hargaBeli + rand(2000000, 8000000);

            $motors[] = Motor::create([
                'supplier_id' => $suppliers[array_rand($suppliers)]->id,
                'merk' => $merk,
                'tipe' => $tipe,
                'tahun' => $tahun,
                'warna' => $warna,
                'kondisi' => $kondisi,
                'no_rangka' => 'MH' . strtoupper(Str::random(10)),
                'no_mesin' => 'MS' . strtoupper(Str::random(8)),
                'no_polisi' => 'P ' . rand(1000, 9999) . ' ' . strtoupper(Str::random(2)),
                'bpkb' => 'BPKB-' . strtoupper(Str::random(8)),
                'harga_beli' => $hargaBeli,
                'harga_jual' => $hargaJual,
                'harga_minimal' => $hargaJual - rand(500000, 1500000),
                'status' => $status,
                'tanggal_masuk' => now()->subDays(rand(1, 90)),
            ]);
        }

        $this->command->info('✅ 50 Motor berhasil dibuat!');

        // ===== 5. BUAT BOOKING =====
        for ($i = 0; $i < 15; $i++) {
            // Ambil motor yang statusnya tersedia atau reserved
            $availableMotors = Motor::whereIn('status', ['tersedia', 'reserved'])->get();
            if ($availableMotors->isEmpty()) break;
            
            $motor = $availableMotors->random();
            $customer = $customers[array_rand($customers)];
            
            try {
                Booking::create([
                    'motor_id' => $motor->id,
                    'user_id' => $adminUser->id,
                    'customer_id' => $customer->id,
                    'nama_pembeli' => $customer->nama,
                    'no_hp' => $customer->no_hp,
                    'alamat' => $customer->alamat,
                    'jenis_bayar' => ['tunai', 'kredit', 'indent'][array_rand(['tunai', 'kredit', 'indent'])],
                    'tanggal_booking' => now()->subDays(rand(1, 30)),
                    'pesan' => 'Booking motor ' . $motor->merk . ' ' . $motor->tipe,
                    'status' => ['menunggu', 'dikonfirmasi', 'selesai', 'dibatalkan'][array_rand(['menunggu', 'dikonfirmasi', 'selesai', 'dibatalkan'])],
                ]);
            } catch (\Exception $e) {
                $this->command->error('Error booking: ' . $e->getMessage());
            }
        }
        $this->command->info('✅ 15 Booking berhasil dibuat!');

        // ===== 6. BUAT TRANSAKSI (untuk motor terjual) =====
        $motorTerjual = Motor::where('status', 'terjual')->get();
        foreach ($motorTerjual as $motor) {
            $customer = $customers[array_rand($customers)];
            
            try {
                $transaksi = Transaksi::create([
                    'motor_id' => $motor->id,
                    'customer_id' => $customer->id,
                    'user_id' => $adminUser->id,
                    'nama_pembeli' => $customer->nama,
                    'no_hp_pembeli' => $customer->no_hp,
                    'alamat_pembeli' => $customer->alamat,
                    'tanggal_transaksi' => now()->subDays(rand(1, 60)),
                    'harga_kesepakatan' => $motor->harga_jual,
                    'metode_pembayaran' => ['tunai', 'kredit'][array_rand(['tunai', 'kredit'])],
                    'status_pembayaran' => 'lunas',
                    'keterangan' => 'Transaksi ' . $motor->merk . ' ' . $motor->tipe,
                    'no_invoice' => 'INV-' . date('Ymd') . '-' . str_pad($motor->id, 6, '0', STR_PAD_LEFT),
                ]);

                // ===== 7. BUAT PEMASUKAN =====
                Pemasukan::create([
                    'transaksi_id' => $transaksi->id,
                    'keterangan' => 'Penjualan ' . $motor->merk . ' ' . $motor->tipe,
                    'jumlah' => $transaksi->harga_kesepakatan,
                    'tanggal' => $transaksi->tanggal_transaksi,
                ]);
            } catch (\Exception $e) {
                $this->command->error('Error transaksi: ' . $e->getMessage());
            }
        }
        $this->command->info('✅ ' . $motorTerjual->count() . ' Transaksi & Pemasukan berhasil dibuat!');

        // ===== 8. BUAT PENGELUARAN =====
        $kategoriList = ['pembelian_motor', 'operasional', 'gaji', 'marketing', 'lainnya'];
        for ($i = 1; $i <= 20; $i++) {
            Pengeluaran::create([
                'kategori' => $kategoriList[array_rand($kategoriList)],
                'keterangan' => 'Pengeluaran ' . $i . ' - ' . ['Beli motor', 'Listrik & Air', 'Gaji karyawan', 'Promosi', 'Lain-lain'][array_rand(['Beli motor', 'Listrik & Air', 'Gaji karyawan', 'Promosi', 'Lain-lain'])],
                'jumlah' => rand(200000, 5000000),
                'tanggal' => now()->subDays(rand(1, 60)),
            ]);
        }
        $this->command->info('✅ 20 Pengeluaran berhasil dibuat!');

        // ===== 9. BUAT SERVIS =====
        $servisList = ['Servis Ringan', 'Servis Berat', 'Ganti Oli', 'Tune Up', 'Perbaikan Mesin', 'Perbaikan Kelistrikan'];
        for ($i = 0; $i < 10; $i++) {
            $motor = $motors[array_rand($motors)];
            $customer = $customers[array_rand($customers)];
            
            try {
                Servis::create([
                    'motor_id' => $motor->id,
                    'user_id' => $adminUser->id,
                    'customer_id' => $customer->id,
                    'nama_pelanggan' => $customer->nama,
                    'no_hp' => $customer->no_hp,
                    'alamat' => $customer->alamat,
                    'jenis_servis' => $servisList[array_rand($servisList)],
                    'keluhan' => 'Keluhan servis motor ' . $motor->merk . ' ' . $motor->tipe,
                    'tanggal_servis' => now()->subDays(rand(1, 30)),
                    'estimasi_selesai' => now()->addDays(rand(1, 7)),
                    'status' => ['menunggu', 'dikerjakan', 'selesai', 'batal'][array_rand(['menunggu', 'dikerjakan', 'selesai', 'batal'])],
                    'catatan' => 'Catatan servis ' . $i,
                ]);
            } catch (\Exception $e) {
                $this->command->error('Error servis: ' . $e->getMessage());
            }
        }
        $this->command->info('✅ 10 Servis berhasil dibuat!');

        $this->command->info('🎉 SEMUA DATA DUMMY BERHASIL DIBUAT!');
        $this->command->info('📊 Total Motor: 50 (30 Tersedia, 15 Reserved, 5 Terjual)');
        $this->command->info('📊 Total Customer: 20');
        $this->command->info('📊 Total Booking: 15');
        $this->command->info('📊 Total Transaksi: ' . $motorTerjual->count());
        $this->command->info('📊 Total Pengeluaran: 20');
        $this->command->info('📊 Total Servis: 10');
    }
}