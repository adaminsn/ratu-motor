<?php

namespace Database\Seeders;

use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use Illuminate\Database\Seeder;

class KeuanganSeeder extends Seeder
{
    public function run()
    {
        // ===== PEMASUKAN MANUAL =====
        Pemasukan::create([
            'keterangan' => 'Penjualan Aksesoris Motor',
            'jumlah' => 2500000,
            'tanggal' => now()->subDays(10),
        ]);

        Pemasukan::create([
            'keterangan' => 'Servis Motor Pelanggan',
            'jumlah' => 750000,
            'tanggal' => now()->subDays(8),
        ]);

        Pemasukan::create([
            'keterangan' => 'Penjualan Sparepart',
            'jumlah' => 1200000,
            'tanggal' => now()->subDays(5),
        ]);

        Pemasukan::create([
            'keterangan' => 'Jasa Ganti Oli',
            'jumlah' => 450000,
            'tanggal' => now()->subDays(3),
        ]);

        // ===== PENGELUARAN =====
        Pengeluaran::create([
            'kategori' => 'operasional',
            'keterangan' => 'Listrik dan Air',
            'jumlah' => 850000,
            'tanggal' => now()->subDays(12),
        ]);

        Pengeluaran::create([
            'kategori' => 'operasional',
            'keterangan' => 'Internet dan Telepon',
            'jumlah' => 350000,
            'tanggal' => now()->subDays(9),
        ]);

        Pengeluaran::create([
            'kategori' => 'gaji',
            'keterangan' => 'Gaji Karyawan Bulan Ini',
            'jumlah' => 6500000,
            'tanggal' => now()->subDays(7),
        ]);

        Pengeluaran::create([
            'kategori' => 'marketing',
            'keterangan' => 'Promosi Instagram & TikTok',
            'jumlah' => 500000,
            'tanggal' => now()->subDays(6),
        ]);

        Pengeluaran::create([
            'kategori' => 'marketing',
            'keterangan' => 'Cetak Brosur dan Spanduk',
            'jumlah' => 300000,
            'tanggal' => now()->subDays(4),
        ]);

        Pengeluaran::create([
            'kategori' => 'pembelian_motor',
            'keterangan' => 'Pembelian Honda Vario 160 (Bekas)',
            'jumlah' => 22000000,
            'tanggal' => now()->subDays(15),
        ]);

        Pengeluaran::create([
            'kategori' => 'pembelian_motor',
            'keterangan' => 'Pembelian Yamaha NMAX 155 (Bekas)',
            'jumlah' => 28000000,
            'tanggal' => now()->subDays(20),
        ]);

        Pengeluaran::create([
            'kategori' => 'lainnya',
            'keterangan' => 'Donasi Sosial',
            'jumlah' => 200000,
            'tanggal' => now()->subDays(2),
        ]);
    }
}