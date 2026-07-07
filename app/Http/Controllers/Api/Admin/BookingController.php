<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['motor', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Tambahkan search
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->whereHas('user', function($q2) use ($request) {
                      $q2->where('name', 'like', '%' . $request->search . '%');
                  })
                  ->orWhereHas('customer', function($q2) use ($request) {
                      $q2->where('nama', 'like', '%' . $request->search . '%');
                  })
                  ->orWhereHas('motor', function($q2) use ($request) {
                      $q2->where('merk', 'like', '%' . $request->search . '%')
                         ->orWhere('tipe', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $perPage = $request->get('per_page', 10);
        $bookings = $query->latest()->paginate($perPage);
        
        return response()->json($bookings);
    }

    public function show($id)
    {
        $booking = Booking::with(['motor', 'user'])->findOrFail($id);
        return response()->json($booking);
    }

    public function getByMotor($motorId)
    {
        $bookings = Booking::with(['motor', 'user'])
            ->where('motor_id', $motorId)
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    public function confirm($id)
    {
        try {
            Log::info('🔵 Confirm booking ID: ' . $id);
            
            $booking = Booking::findOrFail($id);
            
            Log::info('Current status: ' . $booking->status);

            if ($booking->status !== 'menunggu') {
                return response()->json([
                    'message' => 'Hanya booking berstatus "menunggu" yang bisa dikonfirmasi. Status saat ini: ' . $booking->status
                ], 422);
            }

            // Update status
            $booking->status = 'dikonfirmasi';
            $booking->save();
            
            // Refresh model
            $booking->refresh();
            
            Log::info('✅ Status after update: ' . $booking->status);

            return response()->json([
                'message' => 'Booking berhasil dikonfirmasi',
                'data' => $booking->load(['motor', 'user'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error confirming booking: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal mengonfirmasi booking: ' . $e->getMessage()
            ], 500);
        }
    }

    public function complete(Request $request, $id)
    {
        try {
            Log::info('🟢 Complete booking ID: ' . $id);
            
            $booking = Booking::with(['motor', 'user'])->findOrFail($id);
            
            Log::info('Current status: ' . $booking->status);

            if ($booking->status !== 'dikonfirmasi') {
                return response()->json([
                    'message' => 'Hanya booking berstatus "dikonfirmasi" yang bisa diselesaikan. Status saat ini: ' . $booking->status
                ], 422);
            }

            $request->validate([
                'harga_kesepakatan' => 'nullable|numeric|min:0',
                'status_pembayaran' => 'nullable|in:lunas,pending',
            ]);

            $result = DB::transaction(function () use ($request, $booking) {
                $motor = $booking->motor;
                $user = $booking->user;

                // Cari atau buat row Customer yang terhubung ke user ini
                $customer = Customer::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'nama' => $user->name,
                        'no_hp' => $user->no_hp ?? '-',
                    ]
                );

                // Buat transaksi resmi otomatis
                $transaksi = Transaksi::create([
                    'motor_id' => $motor->id,
                    'user_id' => $request->user()->id,
                    'customer_id' => $customer->id,
                    'tanggal_transaksi' => now()->toDateString(),
                    'harga_kesepakatan' => $request->harga_kesepakatan ?? $motor->harga_jual,
                    'metode_pembayaran' => $booking->jenis_bayar === 'indent' ? 'tunai' : $booking->jenis_bayar,
                    'status_pembayaran' => $request->status_pembayaran ?? 'lunas',
                    'keterangan' => 'Otomatis dibuat dari booking #' . $booking->id,
                ]);

                // Update motor
                $motor->update(['status' => 'terjual']);
                
                // Update booking
                $booking->status = 'selesai';
                $booking->save();
                $booking->refresh();

                return $transaksi;
            });

            Log::info('✅ Booking completed: ' . $booking->id . ', status: ' . $booking->status);

            return response()->json([
                'message' => 'Booking ditandai selesai dan transaksi resmi berhasil dibuat.',
                'data' => $booking->fresh()->load(['motor', 'user']),
                'transaksi' => $result->load(['motor', 'user', 'customer']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error completing booking: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal menyelesaikan booking: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cancel($id)
    {
        try {
            Log::info('🔴 Cancel booking ID: ' . $id);
            
            $booking = Booking::findOrFail($id);
            
            Log::info('Current status: ' . $booking->status);

            if (!in_array($booking->status, ['menunggu', 'dikonfirmasi'])) {
                return response()->json([
                    'message' => 'Booking ini tidak bisa dibatalkan. Status saat ini: ' . $booking->status
                ], 422);
            }

            // Update status
            $booking->status = 'dibatalkan';
            $booking->save();
            $booking->refresh();
            
            // Update motor
            if ($booking->motor) {
                $booking->motor->update(['status' => 'tersedia']);
            }
            
            Log::info('✅ Booking cancelled: ' . $booking->id . ', status: ' . $booking->status);

            return response()->json([
                'message' => 'Booking berhasil dibatalkan',
                'data' => $booking->load(['motor', 'user'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error cancelling booking: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal membatalkan booking: ' . $e->getMessage()
            ], 500);
        }
    }

    // app/Http/Controllers/Api/Admin/BookingController.php

public function getChanges(Request $request)
{
    $lastCheck = $request->input('last_check', now()->subMinutes(5));
    
    $logs = BookingLog::with(['booking', 'booking.motor', 'user'])
        ->where('created_at', '>', $lastCheck)
        ->orderBy('created_at', 'desc')
        ->get();
    
    return response()->json([
        'changes' => $logs,
        'timestamp' => now()
    ]);
}
}