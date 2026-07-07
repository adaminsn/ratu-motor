<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Servis;
use App\Models\Motor;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ServisController extends Controller
{
    /**
     * Get servis history for customer
     */
    public function index()
    {
        $user = Auth::user();
        
        $customer = DB::table('customers')->where('user_id', $user->id)->first();
        
        $query = Servis::with('motor')->where('user_id', $user->id);
        
        if ($customer) {
            $query->orWhere('customer_id', $customer->id);
        }
        
        $servis = $query->latest()->get();

        return response()->json([
            'data' => $servis
        ]);
    }

    /**
     * Get motors that customer has bought
     * MENCARI MOTOR DARI SEMUA TRANSAKSI YANG TERKAIT DENGAN CUSTOMER
     */
    public function myMotors()
    {
        $user = Auth::user();
        
        // ===== CARA 1: Langsung dari transaksi dengan customer_id = user_id (BISA SALAH KARENA BEDA TABEL) =====
        // Dihapus karena customer_id di transaksi mengarah ke customers.id, bukan users.id
        
        // ===== CARA 2: Dari transaksi melalui tabel customers =====
        $customer = DB::table('customers')->where('user_id', $user->id)->first();
        $motorIds2 = [];
        if ($customer) {
            $motorIds2 = Transaksi::where('customer_id', $customer->id)
                ->pluck('motor_id')
                ->toArray();
        }
        
        // ===== CARA 3: Dari transaksi yang memiliki relasi ke customer dengan user_id =====
        $motorIds3 = Transaksi::whereHas('customer', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->pluck('motor_id')
            ->toArray();
        
        // ===== CARA 4: Dari tabel servis (jika customer pernah servis) =====
        $motorIds4 = Servis::where('user_id', $user->id);
        
        if ($customer) {
            $motorIds4 = $motorIds4->orWhere('customer_id', $customer->id);
        }
        
        $motorIds4 = $motorIds4->pluck('motor_id')->toArray();
        
        // ===== GABUNGKAN SEMUA ID =====
        $allMotorIds = array_merge($motorIds2, $motorIds3, $motorIds4);
        $uniqueMotorIds = array_unique($allMotorIds);
        
        // ===== AMBIL MOTOR =====
        $motors = Motor::whereIn('id', $uniqueMotorIds)
            ->whereIn('status', ['terjual', 'selesai'])
            ->orderBy('merk')
            ->orderBy('tipe')
            ->get();
        
        // ===== Jika masih kosong, ambil semua motor yang statusnya terjual =====
        // (untuk kasus di mana data transaksi tidak lengkap)
        if ($motors->isEmpty()) {
            // Coba cari dari transaksi terbaru
            $latestTransaksi = Transaksi::where('customer_id', $user->id)
                ->orWhereHas('customer', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->latest()
                ->first();
            
            if ($latestTransaksi) {
                $motors = Motor::where('id', $latestTransaksi->motor_id)
                    ->whereIn('status', ['terjual', 'selesai'])
                    ->get();
            }
        }
        
        // ===== DEBUG INFO =====
        $debug = [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'motor_ids_from_transaksi_2' => $motorIds2,
            'motor_ids_from_transaksi_3' => $motorIds3,
            'motor_ids_from_servis' => $motorIds4,
            'all_unique_motor_ids' => $uniqueMotorIds,
            'total_motors_found' => $motors->count(),
            'motors' => $motors->map(function($m) {
                return [
                    'id' => $m->id,
                    'name' => $m->merk . ' ' . $m->tipe,
                    'status' => $m->status
                ];
            })
        ];

        return response()->json([
            'data' => $motors,
            'debug' => $debug
        ]);
    }

    /**
     * Store new servis booking
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'motor_id'       => 'required|exists:motors,id',
            'jenis_servis'   => 'required|string|max:255',
            'keluhan'        => 'nullable|string',
            'tanggal_servis' => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        // CEK: Apakah motor ini pernah dibeli oleh customer?
        $pernahBeli = Transaksi::where('motor_id', $request->motor_id)
            ->whereHas('customer', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->exists();

        // Jika tidak ditemukan di transaksi, cek di servis
        if (!$pernahBeli) {
            $pernahServis = Servis::where('motor_id', $request->motor_id)
                ->where(function($query) use ($user) {
                    $query->where('customer_id', $user->id)
                          ->orWhere('user_id', $user->id);
                })
                ->exists();
            
            if ($pernahServis) {
                $pernahBeli = true;
            }
        }

        if (!$pernahBeli) {
            return response()->json([
                'message' => 'Kamu hanya bisa mengajukan servis untuk motor yang pernah kamu beli di showroom ini.'
            ], 403);
        }

        // CEK: Status motor harus 'terjual' atau 'selesai'
        $motor = Motor::find($request->motor_id);
        if (!$motor || !in_array($motor->status, ['terjual', 'selesai'])) {
            return response()->json([
                'message' => 'Motor ini belum terdaftar sebagai motor terjual. Status: ' . ($motor ? $motor->status : 'tidak ditemukan')
            ], 422);
        }

        // CEK: Apakah motor sudah punya booking servis aktif?
        $existingBooking = Servis::where('motor_id', $request->motor_id)
            ->whereIn('status', ['menunggu', 'dikerjakan'])
            ->first();

        if ($existingBooking) {
            return response()->json([
                'message' => 'Motor ini masih dalam proses servis dengan status "' . $existingBooking->status . '". Silakan tunggu hingga selesai.'
            ], 422);
        }

        $customer = \App\Models\Customer::where('user_id', $user->id)->first();

        // Buat servis
        $servis = Servis::create([
            'motor_id'        => $request->motor_id,
            'user_id'         => $user->id,
            'customer_id'     => $customer ? $customer->id : null,
            'nama_pelanggan'  => $user->name,
            'no_hp'           => $user->no_hp ?? '-',
            'alamat'          => $user->alamat ?? null,
            'jenis_servis'    => $request->jenis_servis,
            'keluhan'         => $request->keluhan,
            'tanggal_servis'  => $request->tanggal_servis,
            'estimasi_selesai' => null,
            'status'          => 'menunggu',
            'catatan'         => null
        ]);

        return response()->json([
            'message' => 'Pengajuan servis berhasil dikirim, menunggu konfirmasi teknisi.',
            'data'    => $servis->load('motor')
        ], 201);
    }

    /**
     * Show specific servis
     */
    public function show($id)
    {
        $user = Auth::user();
        
        $customer = DB::table('customers')->where('user_id', $user->id)->first();
        
        $query = Servis::with('motor')->where(function($q) use ($user, $customer) {
            $q->where('user_id', $user->id);
            if ($customer) {
                $q->orWhere('customer_id', $customer->id);
            }
        });
        
        $servis = $query->findOrFail($id);

        return response()->json([
            'data' => $servis
        ]);
    }

    /**
     * Cancel servis booking
     */
    public function cancel($id)
    {
        $user = Auth::user();
        
        $customer = DB::table('customers')->where('user_id', $user->id)->first();
        
        $query = Servis::where(function($q) use ($user, $customer) {
            $q->where('user_id', $user->id);
            if ($customer) {
                $q->orWhere('customer_id', $customer->id);
            }
        });
        
        $servis = $query->whereIn('status', ['menunggu', 'dikerjakan'])
            ->findOrFail($id);

        $servis->update(['status' => 'batal']);

        return response()->json([
            'message' => 'Booking servis berhasil dibatalkan',
            'data' => $servis->load('motor')
        ]);
    }
}