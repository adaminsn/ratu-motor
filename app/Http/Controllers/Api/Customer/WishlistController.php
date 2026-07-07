<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Motor;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlists = Wishlist::with('motor.photos')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($wishlists);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'motor_id' => 'required|exists:motors,id'
        ]);

        $userId = $request->user()->id;
        $motorId = $request->motor_id;

        $exists = Wishlist::where('user_id', $userId)
            ->where('motor_id', $motorId)
            ->exists();

        if ($exists) {
            Wishlist::where('user_id', $userId)
                ->where('motor_id', $motorId)
                ->delete();
            
            return response()->json([
                'message' => 'Motor dihapus dari wishlist',
                'status' => 'removed'
            ]);
        }

        Wishlist::create([
            'user_id' => $userId,
            'motor_id' => $motorId
        ]);

        return response()->json([
            'message' => 'Motor ditambahkan ke wishlist',
            'status' => 'added'
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $wishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $wishlist->delete();

        return response()->json([
            'message' => 'Motor dihapus dari wishlist'
        ]);
    }

    public function check(Request $request, $motorId)
    {
        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('motor_id', $motorId)
            ->exists();

        return response()->json(['is_wishlist' => $exists]);
    }
}