<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicMotorResource;
use App\Models\Motor;
use Illuminate\Http\Request;

class KatalogController extends Controller
{
    public function index(Request $request)
    {
        $query = Motor::with('photos')->where('status', 'tersedia');

        if ($request->filled('merk')) {
            $query->where('merk', $request->merk);
        }
        if ($request->filled('tahun')) {
            $query->where('tahun', $request->tahun);
        }
        if ($request->filled('harga_min')) {
            $query->where('harga_jual', '>=', $request->harga_min);
        }
        if ($request->filled('harga_max')) {
            $query->where('harga_jual', '<=', $request->harga_max);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('merk', 'like', "%{$search}%")
                    ->orWhere('tipe', 'like', "%{$search}%");
            });
        }

        // ===== PERUBAHAN: Pagination dengan default 12 =====
        $perPage = $request->get('per_page', 12); // Default 12, bukan 1000
        $motors = $query->latest()->paginate($perPage);

        return PublicMotorResource::collection($motors);
    }

    public function show($id)
    {
        // Cari motor dengan status tersedia
        $motor = Motor::with('photos')
            ->where('status', 'tersedia')
            ->find($id);

        if (!$motor) {
            return response()->json([
                'message' => 'Motor tidak ditemukan atau sudah tidak tersedia.'
            ], 404);
        }

        return response()->json([
            'data' => $motor
        ]);
    }
}