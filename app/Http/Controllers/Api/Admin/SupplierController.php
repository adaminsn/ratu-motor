<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::withCount('motors');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%")
                    ->orWhere('alamat', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $suppliers = $query->latest()->paginate($perPage);

        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
            'alamat' => 'nullable|string',
            'keterangan' => 'nullable|string',
            'jumlah_motor' => 'nullable|integer|min:0', // ← TAMBAHKAN INI
        ]);

        $supplier = Supplier::create($validated);

        return response()->json([
            'message' => 'Supplier berhasil ditambahkan.',
            'supplier' => $supplier,
        ], 201);
    }

    public function show(Supplier $supplier)
    {
        return response()->json([
            'supplier' => $supplier->load('motors'),
            'total_nilai_pembelian' => $supplier->motors()->sum('harga_beli'),
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'no_hp' => 'sometimes|required|string|max:20',
            'alamat' => 'nullable|string',
            'keterangan' => 'nullable|string',
            'jumlah_motor' => 'nullable|integer|min:0', 
        ]);

        $supplier->update($validated);

        return response()->json([
            'message' => 'Supplier berhasil diperbarui.',
            'supplier' => $supplier,
        ]);
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return response()->json([
            'message' => 'Supplier berhasil dihapus.',
        ]);
    }
}