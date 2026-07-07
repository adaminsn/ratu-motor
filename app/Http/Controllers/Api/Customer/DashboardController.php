<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Motor;
use App\Models\Booking;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $motorTersedia = Motor::where('status', 'tersedia')->count();
        $bookingSaya = Booking::where('user_id', $user->id)->count();
        $wishlistSaya = Wishlist::where('user_id', $user->id)->count();

        $motorUnggulan = Motor::where('status', 'tersedia')
            ->with('photos')
            ->latest()
            ->take(4)
            ->get();

        $recentBookings = Booking::where('user_id', $user->id)
            ->with('motor')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'motor_tersedia' => $motorTersedia,
            'booking_saya' => $bookingSaya,
            'wishlist_saya' => $wishlistSaya,
            'motor_unggulan' => $motorUnggulan,
            'recent_bookings' => $recentBookings ?? [],
        ]);
    }
}