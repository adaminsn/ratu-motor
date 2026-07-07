<?php

namespace Database\Seeders;

use App\Models\Motor;
use Illuminate\Database\Seeder;

class MotorSeeder extends Seeder
{
    public function run(): void
    {
        $motors = [
            ['merk' => 'Honda', 'tipe' => 'Beat', 'tahun' => 2023, 'warna' => 'Merah', 'kondisi' => 'bekas', 'status' => 'tersedia', 'hari_lalu' => 5],
            ['merk' => 'Honda', 'tipe' => 'Vario 125', 'tahun' => 2024, 'warna' => 'Hitam', 'kondisi' => 'baru', 'status' => 'tersedia', 'hari_lalu' => 2],
            ['merk' => 'Honda', 'tipe' => 'PCX', 'tahun' => 2023, 'warna' => 'Putih', 'kondisi' => 'bekas', 'status' => 'terjual', 'hari_lalu' => 20],
            ['merk' => 'Honda', 'tipe' => 'Scoopy', 'tahun' => 2022, 'warna' => 'Krem', 'kondisi' => 'bekas', 'status' => 'tersedia', 'hari_lalu' => 45],
            ['merk' => 'Yamaha', 'tipe' => 'NMAX', 'tahun' => 2024, 'warna' => 'Hitam', 'kondisi' => 'baru', 'status' => 'reserved', 'hari_lalu' => 3],
            ['merk' => 'Yamaha', 'tipe' => 'Aerox', 'tahun' => 2023, 'warna' => 'Biru', 'kondisi' => 'bekas', 'status' => 'tersedia', 'hari_lalu' => 10],
            ['merk' => 'Yamaha', 'tipe' => 'Mio', 'tahun' => 2021, 'warna' => 'Merah', 'kondisi' => 'bekas', 'status' => 'terjual', 'hari_lalu' => 60],
            ['merk' => 'Yamaha', 'tipe' => 'Fazzio', 'tahun' => 2024, 'warna' => 'Putih', 'kondisi' => 'baru', 'status' => 'tersedia', 'hari_lalu' => 1],
            ['merk' => 'Suzuki', 'tipe' => 'Nex II', 'tahun' => 2022, 'warna' => 'Abu-abu', 'kondisi' => 'bekas', 'status' => 'tersedia', 'hari_lalu' => 35],
            ['merk' => 'Suzuki', 'tipe' => 'Address', 'tahun' => 2023, 'warna' => 'Hitam', 'kondisi' => 'bekas', 'status' => 'terjual', 'hari_lalu' => 15],
            ['merk' => 'Kawasaki', 'tipe' => 'W175', 'tahun' => 2023, 'warna' => 'Hijau', 'kondisi' => 'bekas', 'status' => 'tersedia', 'hari_lalu' => 8],
            ['merk' => 'Kawasaki', 'tipe' => 'KLX 150', 'tahun' => 2022, 'warna' => 'Hijau', 'kondisi' => 'bekas', 'status' => 'reserved', 'hari_lalu' => 12],
        ];

        foreach ($motors as $i => $m) {
            Motor::create([
                'merk' => $m['merk'],
                'tipe' => $m['tipe'],
                'tahun' => $m['tahun'],
                'warna' => $m['warna'],
                'kondisi' => $m['kondisi'],
                'no_rangka' => 'MH1DUMMY' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'no_mesin' => 'DUMMY' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'bpkb' => 'BPKB-DUMMY-' . ($i + 1),
                'harga_beli' => rand(8, 25) * 1000000,
                'harga_jual' => rand(10, 30) * 1000000,
                'status' => $m['status'],
                'tanggal_masuk' => now()->subDays($m['hari_lalu']),
            ]);
        }
    }
}