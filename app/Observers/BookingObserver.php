<?php
// app/Observers/BookingObserver.php

namespace App\Observers;

use App\Models\Booking;
use App\Models\BookingLog;
use Illuminate\Support\Facades\Auth;

class BookingObserver
{
    /**
     * Handle the Booking "updated" event.
     */
    public function updated(Booking $booking): void
    {
        // Cek apakah status berubah
        if ($booking->isDirty('status')) {
            $oldStatus = $booking->getOriginal('status');
            $newStatus = $booking->status;
            
            // Tentukan siapa yang mengubah
            $user = Auth::user();
            $changedBy = $user && $user->hasRole(['super_admin', 'admin', 'kasir']) 
                ? 'admin' 
                : 'customer';
            
            // Simpan log perubahan
            BookingLog::create([
                'booking_id' => $booking->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $changedBy,
                'user_id' => $user ? $user->id : 1,
            ]);
        }
    }
}