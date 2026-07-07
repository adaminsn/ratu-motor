<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    /**
     * Get all bookings for customer
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            $bookings = Booking::with(['motor', 'user'])
                ->where('user_id', $user->id)
                ->latest()
                ->get();

            return response()->json([
                'data' => $bookings
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching bookings: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memuat data booking'
            ], 500);
        }
    }

    /**
     * Get single booking detail
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            
            $booking = Booking::with(['motor', 'user'])
                ->where('user_id', $user->id)
                ->findOrFail($id);

            return response()->json($booking);
        } catch (\Exception $e) {
            Log::error('Error fetching booking detail: ' . $e->getMessage());
            return response()->json([
                'message' => 'Booking tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Store new booking
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'motor_id' => 'required|exists:motors,id',
                'jenis_bayar' => 'required|in:tunai,kredit,indent',
                'tanggal_booking' => 'required|date|after_or_equal:today',
                'pesan' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Cek apakah motor sudah dibooking oleh customer lain
            $existingBooking = Booking::where('motor_id', $request->motor_id)
                ->whereIn('status', ['menunggu', 'dikonfirmasi'])
                ->first();

            if ($existingBooking) {
                return response()->json([
                    'message' => 'Motor ini sudah di-booking oleh customer lain. Silakan pilih motor lain.'
                ], 422);
            }

            // Buat booking
            $booking = Booking::create([
                'motor_id' => $request->motor_id,
                'user_id' => $user->id,
                'jenis_bayar' => $request->jenis_bayar,
                'tanggal_booking' => $request->tanggal_booking,
                'pesan' => $request->pesan,
                'status' => 'menunggu'
            ]);

            // Update status motor menjadi reserved
            if ($booking->motor) {
                $booking->motor->update(['status' => 'reserved']);
            }

            return response()->json([
                'message' => 'Booking berhasil dibuat!',
                'data' => $booking->load(['motor', 'user'])
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating booking: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal membuat booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel booking
     */
    public function cancel($id)
    {
        try {
            Log::info('Attempting to cancel booking ID: ' . $id);
            
            $user = Auth::user();
            
            // Log user info
            Log::info('User ID: ' . $user->id . ', Email: ' . $user->email);
            
            // Cari booking milik user ini
            $booking = Booking::where('user_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$booking) {
                Log::warning('Booking not found for user: ' . $user->id . ', booking ID: ' . $id);
                return response()->json([
                    'message' => 'Booking tidak ditemukan'
                ], 404);
            }

            Log::info('Booking found: ', ['id' => $booking->id, 'status' => $booking->status]);

            // Cek apakah booking bisa dibatalkan
            if (!in_array($booking->status, ['menunggu', 'dikonfirmasi'])) {
                Log::warning('Cannot cancel booking with status: ' . $booking->status);
                return response()->json([
                    'message' => 'Booking dengan status "' . $booking->status . '" tidak dapat dibatalkan'
                ], 422);
            }

            // Update status booking
            $booking->update(['status' => 'dibatalkan']);
            
            // Kembalikan status motor ke tersedia
            if ($booking->motor) {
                $booking->motor->update(['status' => 'tersedia']);
                Log::info('Motor status updated to tersedia: ' . $booking->motor->id);
            }

            Log::info('Booking cancelled successfully: ' . $booking->id);

            return response()->json([
                'message' => 'Booking berhasil dibatalkan',
                'data' => $booking->load(['motor', 'user'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error cancelling booking: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Gagal membatalkan booking: ' . $e->getMessage()
            ], 500);
        }
    }
}