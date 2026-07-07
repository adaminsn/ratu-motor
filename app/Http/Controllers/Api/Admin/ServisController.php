<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Servis;
use App\Models\Motor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ServisController extends Controller
{
    public function index(Request $request)
    {
        $query = Servis::with(['motor', 'user']);

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_pelanggan', 'like', "%{$search}%")
                  ->orWhere('no_hp', 'like', "%{$search}%")
                  ->orWhere('jenis_servis', 'like', "%{$search}%")
                  ->orWhereHas('motor', function ($mq) use ($search) {
                      $mq->where('merk', 'like', "%{$search}%")
                        ->orWhere('tipe', 'like', "%{$search}%")
                        ->orWhere('no_rangka', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->get('per_page', 10);
        $servis = $query->latest()->paginate($perPage);

        return response()->json($servis);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'motor_id' => 'required|exists:motors,id',
            'nama_pelanggan' => 'required|string|max:255',
            'no_hp' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'jenis_servis' => 'required|string|max:255',
            'keluhan' => 'nullable|string',
            'tanggal_servis' => 'required|date',
            'estimasi_selesai' => 'nullable|date|after_or_equal:tanggal_servis',
            'catatan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $motor = Motor::find($request->motor_id);
        if (!$motor) {
            return response()->json([
                'message' => 'Motor tidak ditemukan'
            ], 404);
        }

        // CEK: Motor harus sudah terjual (termasuk selesai)
        if (!in_array($motor->status, ['terjual', 'selesai'])) {
            return response()->json([
                'message' => 'Servis hanya berlaku untuk motor yang sudah terjual (garansi purnajual). Status motor saat ini: ' . $motor->status,
            ], 422);
        }

        // CEK: Apakah motor sudah punya booking servis aktif?
        $existingBooking = Servis::where('motor_id', $request->motor_id)
            ->whereIn('status', ['menunggu', 'dikerjakan'])
            ->first();

        if ($existingBooking) {
            return response()->json([
                'message' => 'Motor ini masih memiliki booking servis aktif dengan status "' . $existingBooking->status . '". Selesaikan atau batalkan terlebih dahulu.',
            ], 422);
        }

        $servis = Servis::create([
            'motor_id' => $request->motor_id,
            'user_id' => $request->user()->id,
            'customer_id' => $request->customer_id ?? null,
            'nama_pelanggan' => $request->nama_pelanggan,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'jenis_servis' => $request->jenis_servis,
            'keluhan' => $request->keluhan,
            'tanggal_servis' => $request->tanggal_servis,
            'estimasi_selesai' => $request->estimasi_selesai,
            'status' => 'menunggu',
            'catatan' => $request->catatan
        ]);

        return response()->json([
            'message' => 'Booking servis berhasil dibuat',
            'data' => $servis->load(['motor', 'user'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $servis = Servis::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:menunggu,dikerjakan,selesai,batal',
            'estimasi_selesai' => 'nullable|date|after_or_equal:today',
            'catatan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Jika update status, validasi transisi
        if ($request->has('status')) {
            $newStatus = $request->status;
            $currentStatus = $servis->status;
            
            // Definisikan transisi yang diperbolehkan
            $allowedTransitions = [
                'menunggu' => ['dikerjakan', 'batal'],
                'dikerjakan' => ['selesai', 'batal'],
                'selesai' => [],
                'batal' => []
            ];

            // Cek apakah transisi diperbolehkan
            if (!in_array($newStatus, $allowedTransitions[$currentStatus] ?? [])) {
                return response()->json([
                    'message' => "Tidak dapat mengubah status dari '{$currentStatus}' ke '{$newStatus}'",
                    'allowed_transitions' => $allowedTransitions[$currentStatus] ?? []
                ], 422);
            }

            // Jika status berubah menjadi 'selesai', update estimasi_selesai ke hari ini jika belum diisi
            if ($newStatus === 'selesai' && !$request->has('estimasi_selesai')) {
                $request->merge(['estimasi_selesai' => now()->toDateString()]);
            }
        }

        $servis->update($request->only(['status', 'estimasi_selesai', 'catatan']));

        return response()->json([
            'message' => 'Status servis diperbarui',
            'data' => $servis->load(['motor', 'user'])
        ]);
    }

    public function show($id)
    {
        $servis = Servis::with(['motor', 'user'])->findOrFail($id);
        return response()->json([
            'data' => $servis
        ]);
    }

    public function destroy($id)
    {
        try {
            $servis = Servis::findOrFail($id);
            
            // Cek apakah servis bisa dihapus
            // Hanya status 'menunggu', 'batal', atau 'selesai' yang bisa dihapus
            if (!in_array($servis->status, ['menunggu', 'batal', 'selesai'])) {
                return response()->json([
                    'message' => "Booking servis dengan status '{$servis->status}' tidak bisa dihapus. Status yang bisa dihapus: menunggu, batal, selesai."
                ], 422);
            }

            $servisData = [
                'id' => $servis->id,
                'nama_pelanggan' => $servis->nama_pelanggan,
                'motor' => $servis->motor ? $servis->motor->merk . ' ' . $servis->motor->tipe : 'Motor tidak ditemukan'
            ];

            $servis->delete();

            return response()->json([
                'message' => 'Booking servis berhasil dihapus',
                'data' => $servisData
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Booking servis tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus booking servis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get servis by motor ID
     */
    public function getByMotor($motorId)
    {
        $servis = Servis::with(['motor', 'user'])
            ->where('motor_id', $motorId)
            ->latest()
            ->get();

        return response()->json([
            'data' => $servis
        ]);
    }

    /**
     * Get servis statistics
     */
    public function stats(Request $request)
    {
        $stats = [
            'total' => Servis::count(),
            'menunggu' => Servis::where('status', 'menunggu')->count(),
            'dikerjakan' => Servis::where('status', 'dikerjakan')->count(),
            'selesai' => Servis::where('status', 'selesai')->count(),
            'batal' => Servis::where('status', 'batal')->count(),
        ];

        // Servis per bulan (6 bulan terakhir)
        $monthly = Servis::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as total')
        )
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        return response()->json([
            'stats' => $stats,
            'monthly' => $monthly
        ]);
    }

    /**
     * Get motors that are already sold (for servis dropdown)
     */
    public function getMotorsTerjual(Request $request)
    {
        $motors = Motor::whereIn('status', ['terjual', 'selesai'])
            ->orderBy('merk')
            ->orderBy('tipe')
            ->get(['id', 'merk', 'tipe', 'no_rangka', 'status']);

        return response()->json([
            'data' => $motors
        ]);
    }
}