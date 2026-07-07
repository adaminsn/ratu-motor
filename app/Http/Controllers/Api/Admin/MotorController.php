<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Motor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MotorController extends Controller
{
    public function index(Request $request)
    {
        $query = Motor::with(['supplier', 'photos']);

        if ($request->filled('merk')) {
            $query->where('merk', $request->merk);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
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
                $q->where('no_rangka', 'like', "%{$search}%")
                    ->orWhere('no_mesin', 'like', "%{$search}%")
                    ->orWhere('merk', 'like', "%{$search}%")
                    ->orWhere('tipe', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $motors = $query->latest()->paginate($perPage);

        return response()->json($motors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'merk' => 'required|string|max:255',
            'tipe' => 'required|string|max:255',
            'tahun' => 'required|integer|min:1980|max:' . (date('Y') + 1),
            'warna' => 'required|string|max:255',
            'kondisi' => 'required|in:baru,bekas',
            'no_rangka' => 'required|string|unique:motors,no_rangka',
            'no_mesin' => 'required|string|unique:motors,no_mesin',
            'no_polisi' => 'nullable|string',
            'bpkb' => 'nullable|string',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'harga_minimal' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:tersedia,reserved,terjual',
            'is_unggulan' => 'boolean',
            'tanggal_masuk' => 'required|date',
        ]);

        $motor = Motor::create($validated);

        return response()->json([
            'message' => 'Motor berhasil ditambahkan.',
            'motor' => $motor->load('supplier'),
        ], 201);
    }

    public function show(Motor $motor)
    {
        return response()->json([
            'motor' => $motor->load(['supplier', 'photos']),
        ]);
    }

    public function update(Request $request, Motor $motor)
    {
        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'merk' => 'sometimes|required|string|max:255',
            'tipe' => 'sometimes|required|string|max:255',
            'tahun' => 'sometimes|required|integer|min:1980|max:' . (date('Y') + 1),
            'warna' => 'sometimes|required|string|max:255',
            'kondisi' => 'sometimes|required|in:baru,bekas',
            'no_rangka' => 'sometimes|required|string|unique:motors,no_rangka,' . $motor->id,
            'no_mesin' => 'sometimes|required|string|unique:motors,no_mesin,' . $motor->id,
            'no_polisi' => 'nullable|string',
            'bpkb' => 'nullable|string',
            'harga_beli' => 'sometimes|required|numeric|min:0',
            'harga_jual' => 'sometimes|required|numeric|min:0',
            'harga_minimal' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:tersedia,reserved,terjual',
            'is_unggulan' => 'boolean',
            'tanggal_masuk' => 'sometimes|required|date',
        ]);

        $motor->update($validated);

        return response()->json([
            'message' => 'Motor berhasil diperbarui.',
            'motor' => $motor->load('supplier'),
        ]);
    }

    public function updateStatus(Request $request, Motor $motor)
    {
        $validated = $request->validate([
            'status' => 'required|in:tersedia,reserved,terjual',
        ]);

        $motor->update($validated);

        return response()->json([
            'message' => 'Status motor berhasil diperbarui.',
            'motor' => $motor,
        ]);
    }

    public function destroy(Motor $motor)
    {
        // Hapus semua foto terkait
        $motor->photos()->delete();
        $motor->delete();

        return response()->json([
            'message' => 'Motor berhasil dihapus.',
        ]);
    }

    /**
     * Upload foto motor dengan nama file yang aman
     */
    public function uploadPhotos(Request $request, Motor $motor)
    {
        $request->validate([
            'photos' => 'required|array|max:10',
            'photos.*' => 'image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $uploaded = [];

        foreach ($request->file('photos') as $photo) {
            // Generate nama file yang aman: timestamp + random + extension
            $extension = $photo->getClientOriginalExtension();
            $filename = time() . '_' . Str::random(10) . '.' . $extension;
            
            // Simpan ke storage dengan nama yang aman
            $path = $photo->storeAs('motor_photos', $filename, 'public');

            // Cek apakah ini foto pertama (jadikan primary)
            $isPrimary = $motor->photos()->count() === 0;

            // Simpan ke database
            $motorPhoto = $motor->photos()->create([
                'photo_path' => $path,
                'is_primary' => $isPrimary,
            ]);

            $uploaded[] = [
                'id' => $motorPhoto->id,
                'photo_path' => $path,
                'is_primary' => $isPrimary,
            ];
        }

        return response()->json([
            'message' => count($uploaded) . ' foto berhasil diupload.',
            'photos' => $uploaded,
        ], 201);
    }

    /**
     * Set foto utama
     */
    public function setPrimaryPhoto(Motor $motor, $photoId)
    {
        $motor->photos()->update(['is_primary' => false]);
        $motor->photos()->where('id', $photoId)->update(['is_primary' => true]);

        return response()->json([
            'message' => 'Foto utama berhasil diperbarui.',
        ]);
    }

    /**
     * Hapus foto
     */
    public function deletePhoto(Motor $motor, $photoId)
    {
        $photo = $motor->photos()->findOrFail($photoId);

        // Hapus file dari storage
        if (Storage::disk('public')->exists($photo->photo_path)) {
            Storage::disk('public')->delete($photo->photo_path);
        }

        $photo->delete();

        // Jika foto yang dihapus adalah primary, set foto lain menjadi primary
        if ($photo->is_primary) {
            $newPrimary = $motor->photos()->first();
            if ($newPrimary) {
                $newPrimary->update(['is_primary' => true]);
            }
        }

        return response()->json([
            'message' => 'Foto berhasil dihapus.',
        ]);
    }
}