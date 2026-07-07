<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\LaporanKeuanganExport;

class KeuanganController extends Controller
{
    public function labaRugi(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        // Pemasukan dari transaksi
        $pemasukanTransaksi = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->where('status_pembayaran', 'lunas')
            ->sum('harga_kesepakatan');

        // Pemasukan manual
        $pemasukanManual = Pemasukan::whereBetween('tanggal', [$startDate, $endDate])
            ->sum('jumlah');

        $totalPemasukan = $pemasukanTransaksi + $pemasukanManual;

        // Pengeluaran
        $pengeluaran = Pengeluaran::whereBetween('tanggal', [$startDate, $endDate])
            ->sum('jumlah');

        $keuntunganKotor = $totalPemasukan - $pengeluaran;

        $pengeluaranPerKategori = Pengeluaran::whereBetween('tanggal', [$startDate, $endDate])
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori')
            ->get();

        return response()->json([
            'periode' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'total_pemasukan' => $totalPemasukan,
            'pemasukan_dari_transaksi' => $pemasukanTransaksi,
            'pemasukan_manual' => $pemasukanManual,
            'total_pengeluaran' => $pengeluaran,
            'pengeluaran_per_kategori' => $pengeluaranPerKategori,
            'keuntungan_kotor' => $keuntunganKotor,
        ]);
    }

    public function tambahPemasukan(Request $request)
    {
        $validated = $request->validate([
            'keterangan' => 'required|string',
            'jumlah' => 'required|numeric|min:0',
            'tanggal' => 'required|date',
        ]);

        $pemasukan = Pemasukan::create($validated);

        return response()->json([
            'message' => 'Pemasukan manual berhasil ditambahkan.',
            'data' => $pemasukan,
        ], 201);
    }

    public function tambahPengeluaran(Request $request)
{
    $validated = $request->validate([
        'kategori' => 'required|in:pembelian_motor,operasional,gaji,marketing,lainnya',
        'keterangan' => 'required|string',
        'jumlah' => 'required|numeric|min:0',
        'tanggal' => 'required|date',
    ]);

    $pengeluaran = Pengeluaran::create($validated);

    return response()->json([
        'message' => 'Pengeluaran berhasil ditambahkan.',
        'data' => $pengeluaran,
    ], 201);
}

// KeuanganController.php
public function getPemasukan(Request $request)
{
    $query = Pemasukan::query();
    
    if ($request->filled('search')) {
        $query->where('keterangan', 'like', "%{$request->search}%");
    }
    
    return response()->json($query->latest()->paginate(10));
}

public function getPengeluaran(Request $request)
{
    $query = Pengeluaran::query();
    
    if ($request->filled('search')) {
        $query->where('keterangan', 'like', "%{$request->search}%");
    }
    if ($request->filled('kategori')) {
        $query->where('kategori', $request->kategori);
    }
    
    return response()->json($query->latest()->paginate(10));
}

// KeuanganController.php
public function deletePemasukan($id)
{
    $pemasukan = Pemasukan::findOrFail($id);
    $pemasukan->delete();
    return response()->json(['message' => 'Pemasukan berhasil dihapus']);
}

public function deletePengeluaran($id)
{
    $pengeluaran = Pengeluaran::findOrFail($id);
    $pengeluaran->delete();
    return response()->json(['message' => 'Pengeluaran berhasil dihapus']);
}

    public function exportPdf(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        $pemasukanTransaksi = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->where('status_pembayaran', 'lunas')
            ->sum('harga_kesepakatan');

        $pemasukanManual = Pemasukan::whereBetween('tanggal', [$startDate, $endDate])
            ->sum('jumlah');

        $totalPemasukan = $pemasukanTransaksi + $pemasukanManual;
        $pengeluaran = Pengeluaran::whereBetween('tanggal', [$startDate, $endDate])->sum('jumlah');
        $keuntunganKotor = $totalPemasukan - $pengeluaran;

        $pengeluaranPerKategori = Pengeluaran::whereBetween('tanggal', [$startDate, $endDate])
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori')
            ->get();

        $data = [
            'periode' => ['start' => $startDate, 'end' => $endDate],
            'total_pemasukan' => $totalPemasukan,
            'pemasukan_dari_transaksi' => $pemasukanTransaksi,
            'pemasukan_manual' => $pemasukanManual,
            'total_pengeluaran' => $pengeluaran,
            'pengeluaran_per_kategori' => $pengeluaranPerKategori,
            'keuntungan_kotor' => $keuntunganKotor,
        ];

        $pdf = Pdf::loadView('pdf.laporan-keuangan', $data);
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('laporan-keuangan-' . now()->format('Y-m-d') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        // Install dulu: composer require maatwebsite/excel
        // Buat export class: php artisan make:export LaporanKeuanganExport

        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        $pemasukanTransaksi = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->where('status_pembayaran', 'lunas')
            ->sum('harga_kesepakatan');

        $pemasukanManual = Pemasukan::whereBetween('tanggal', [$startDate, $endDate])
            ->sum('jumlah');

        $totalPemasukan = $pemasukanTransaksi + $pemasukanManual;
        $pengeluaran = Pengeluaran::whereBetween('tanggal', [$startDate, $endDate])->sum('jumlah');
        $keuntunganKotor = $totalPemasukan - $pengeluaran;

        $pengeluaranPerKategori = Pengeluaran::whereBetween('tanggal', [$startDate, $endDate])
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori')
            ->get();

        $data = [
            'periode' => ['start' => $startDate, 'end' => $endDate],
            'total_pemasukan' => $totalPemasukan,
            'pemasukan_dari_transaksi' => $pemasukanTransaksi,
            'pemasukan_manual' => $pemasukanManual,
            'total_pengeluaran' => $pengeluaran,
            'pengeluaran_per_kategori' => $pengeluaranPerKategori,
            'keuntungan_kotor' => $keuntunganKotor,
        ];

        return Excel::download(new LaporanKeuanganExport($data), 'laporan-keuangan-' . now()->format('Y-m-d') . '.xlsx');
    }

    public function riwayatTransaksi(Request $request)
{
    $request->validate([
        'start_date' => 'nullable|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
    ]);

    $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
    $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

    $transaksi = \App\Models\Transaksi::with(['motor', 'customer', 'user'])
        ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
        ->where('status_pembayaran', 'lunas')
        ->latest('tanggal_transaksi')
        ->get()
        ->map(function ($t) {
            return [
                'id' => $t->id,
                'jenis' => 'penjualan_motor',
                'keterangan' => "Penjualan {$t->motor->merk} {$t->motor->tipe} ({$t->motor->tahun}) kepada {$t->customer->nama}",
                'tanggal' => $t->tanggal_transaksi,
                'jumlah' => $t->harga_kesepakatan,
                'metode_pembayaran' => $t->metode_pembayaran,
                'motor' => [
                    'id' => $t->motor->id,
                    'merk' => $t->motor->merk,
                    'tipe' => $t->motor->tipe,
                    'tahun' => $t->motor->tahun,
                    'warna' => $t->motor->warna,
                    'no_rangka' => $t->motor->no_rangka,
                    'no_mesin' => $t->motor->no_mesin,
                ],
                'customer' => [
                    'nama' => $t->customer->nama,
                    'no_hp' => $t->customer->no_hp,
                ],
                'diproses_oleh' => $t->user->name,
            ];
        });

    return response()->json([
        'periode' => ['start' => $startDate, 'end' => $endDate],
        'total' => $transaksi->count(),
        'data' => $transaksi,
    ]);
}
}