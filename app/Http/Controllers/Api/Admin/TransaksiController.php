<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\Motor;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class TransaksiController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaksi::with(['motor', 'user', 'customer']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($cq) use ($search) {
                    $cq->where('nama', 'like', "%{$search}%")
                        ->orWhere('no_hp', 'like', "%{$search}%");
                })
                ->orWhereHas('motor', function ($mq) use ($search) {
                    $mq->where('merk', 'like', "%{$search}%")
                        ->orWhere('tipe', 'like', "%{$search}%")
                        ->orWhere('no_polisi', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('metode_pembayaran')) {
            $query->where('metode_pembayaran', $request->metode_pembayaran);
        }

        if ($request->filled('status_pembayaran')) {
            $query->where('status_pembayaran', $request->status_pembayaran);
        }

        $perPage = $request->get('per_page', 10);
        $transaksis = $query->latest()->paginate($perPage);

        return response()->json($transaksis);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'motor_id' => 'required|exists:motors,id',
            'nama_pembeli' => 'required|string|max:255',
            'no_hp_pembeli' => 'required|string|max:255',
            'alamat_pembeli' => 'nullable|string',
            'nik_pembeli' => 'nullable|string|max:16',
            'tanggal_transaksi' => 'required|date',
            'harga_kesepakatan' => 'required|numeric|min:0',
            'metode_pembayaran' => 'required|in:tunai,kredit',
            'status_pembayaran' => 'required|in:lunas,pending',
            'keterangan' => 'nullable|string',
        ]);

        $motor = Motor::findOrFail($validated['motor_id']);

        if ($motor->status === 'terjual') {
            return response()->json([
                'message' => 'Motor ini sudah terjual.'
            ], 422);
        }

        $transaksi = DB::transaction(function () use ($validated, $motor, $request) {
            // Cari customer berdasarkan no_hp, atau bikin baru kalau belum pernah ada
            $customer = Customer::firstOrCreate(
                ['no_hp' => $validated['no_hp_pembeli']],
                [
                    'nama' => $validated['nama_pembeli'],
                    'alamat' => $validated['alamat_pembeli'] ?? null,
                    'nik' => $validated['nik_pembeli'] ?? null,
                ]
            );

            $transaksi = Transaksi::create([
                'motor_id' => $motor->id,
                'user_id' => $request->user()->id,
                'customer_id' => $customer->id,
                'tanggal_transaksi' => $validated['tanggal_transaksi'],
                'harga_kesepakatan' => $validated['harga_kesepakatan'],
                'metode_pembayaran' => $validated['metode_pembayaran'],
                'status_pembayaran' => $validated['status_pembayaran'],
                'keterangan' => $validated['keterangan'] ?? null,
            ]);

            $motor->update(['status' => 'terjual']);

            return $transaksi;
        });

        return response()->json([
            'message' => 'Transaksi berhasil diproses.',
            'transaksi' => $transaksi->load(['motor', 'user', 'customer']),
        ], 201);
    }

    public function show(Transaksi $transaksi)
    {
        return response()->json([
            'transaksi' => $transaksi->load(['motor', 'user', 'customer']),
        ]);
    }

    public function destroy(Transaksi $transaksi)
    {
        DB::transaction(function () use ($transaksi) {
            if ($transaksi->motor) {
                $transaksi->motor->update(['status' => 'tersedia']);
            }
            $transaksi->delete();
        });

        return response()->json([
            'message' => 'Transaksi berhasil dihapus dan status motor dikembalikan.',
        ]);
    }

    public function invoice($id)
    {
        try {
            $transaksi = Transaksi::with(['motor', 'user', 'customer'])->findOrFail($id);

            $data = [
                'transaksi' => $transaksi,
                'motor' => $transaksi->motor,
                'user' => $transaksi->user,
                'customer' => $transaksi->customer,
                'tanggal' => now()->format('d F Y'),
            ];

            $pdf = Pdf::loadView('pdf.invoice', $data);
            $pdf->setPaper('A4', 'portrait');

            return $pdf->download('invoice-' . $transaksi->id . '.pdf');

        } catch (\Exception $e) {
            \Log::error('Invoice PDF Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal generate invoice: ' . $e->getMessage()
            ], 500);
        }
    }
}