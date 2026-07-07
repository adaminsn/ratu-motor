<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Motor;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        // Data Motor
        $motorTersedia = Motor::where('status', 'tersedia')->count();
        $motorReserved = Motor::where('status', 'reserved')->count();
        $motorTerjual = Motor::where('status', 'terjual')->count();
        $totalSemuaMotor = Motor::count();

        // Data Transaksi
        $totalPenjualanBulanIni = Transaksi::whereMonth('tanggal_transaksi', date('m'))
            ->whereYear('tanggal_transaksi', date('Y'))
            ->count();

        $totalPemasukanBulanIni = Transaksi::whereMonth('tanggal_transaksi', date('m'))
            ->whereYear('tanggal_transaksi', date('Y'))
            ->where('status_pembayaran', 'lunas')
            ->sum('harga_kesepakatan');

        $totalKeuntunganBulanIni = Transaksi::whereMonth('tanggal_transaksi', date('m'))
            ->whereYear('tanggal_transaksi', date('Y'))
            ->where('status_pembayaran', 'lunas')
            ->join('motors', 'transaksis.motor_id', '=', 'motors.id')
            ->sum(DB::raw('motors.harga_jual - motors.harga_beli'));

        return response()->json([
            'total_motor_tersedia' => $motorTersedia,
            'total_motor_reserved' => $motorReserved,
            'total_motor_terjual' => $motorTerjual,
            'total_semua_motor' => $totalSemuaMotor,
            'total_penjualan_bulan_ini' => $totalPenjualanBulanIni ?: 0,
            'total_pemasukan_bulan_ini' => $totalPemasukanBulanIni ?: 0,
            'total_keuntungan_bulan_ini' => $totalKeuntunganBulanIni ?: 0,
        ]);
    }

    public function charts(Request $request)
    {
        // Motor per Merk
        $motorPerMerk = Motor::selectRaw('merk, count(*) as total')
            ->groupBy('merk')
            ->orderByDesc('total')
            ->get();

        // Penjualan per Bulan (6 bulan terakhir)
        $bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $penjualanPerBulan = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = date('m', strtotime("-$i months"));
            $year = date('Y', strtotime("-$i months"));
            $monthName = $bulan[(int)$month - 1];
            
            $total = Transaksi::whereMonth('tanggal_transaksi', $month)
                ->whereYear('tanggal_transaksi', $year)
                ->count();
            
            $penjualanPerBulan[] = [
                'bulan' => $monthName,
                'total' => $total,
            ];
        }

        // Tunai vs Kredit
        $tunai = Transaksi::where('metode_pembayaran', 'tunai')->count();
        $kredit = Transaksi::where('metode_pembayaran', 'kredit')->count();
        
        $tunaiVsKredit = [
            ['name' => 'Tunai', 'value' => $tunai],
            ['name' => 'Kredit', 'value' => $kredit],
        ];

        return response()->json([
            'motor_per_merk' => $motorPerMerk,
            'penjualan_per_bulan' => $penjualanPerBulan,
            'tunai_vs_kredit' => $tunaiVsKredit,
        ]);
    }

    public function motorBelumTerjual(Request $request)
    {
        $motors = Motor::where('status', 'tersedia')
            ->where('tanggal_masuk', '<=', now()->subDays(30))
            ->orderBy('tanggal_masuk', 'asc')
            ->get(['id', 'merk', 'tipe', 'tanggal_masuk']);

        return response()->json([
            'motors' => $motors,
        ]);
    }
}