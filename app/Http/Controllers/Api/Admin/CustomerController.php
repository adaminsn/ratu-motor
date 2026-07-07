<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('no_hp', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $customers = $query->latest()->paginate($perPage);

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'no_hp' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'nik' => 'nullable|string|max:255',
        ]);

        $customer = Customer::create($request->all());

        return response()->json([
            'message' => 'Customer berhasil ditambahkan',
            'data' => $customer
        ], 201);
    }

    public function show($id)
    {
        try {
            // Cari customer tanpa relasi dulu
            $customer = Customer::find($id);
            
            if (!$customer) {
                return response()->json([
                    'message' => 'Customer tidak ditemukan'
                ], 404);
            }

            return response()->json($customer);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memuat data customer'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->update($request->all());

        return response()->json([
            'message' => 'Customer berhasil diperbarui',
            'data' => $customer
        ]);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json([
            'message' => 'Customer berhasil dihapus'
        ]);
    }

    public function bookings($id)
    {
        try {
            $customer = Customer::find($id);
            if (!$customer) {
                return response()->json([]);
            }
            return response()->json($customer->bookings()->with('motor')->get());
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    public function transactions($id)
    {
        try {
            $customer = Customer::find($id);
            if (!$customer) {
                return response()->json([]);
            }
            return response()->json($customer->transaksis()->with('motor')->get());
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    public function servis($id)
    {
        try {
            $customer = Customer::find($id);
            if (!$customer) {
                return response()->json([]);
            }
            return response()->json($customer->servis()->with('motor')->get());
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }
}