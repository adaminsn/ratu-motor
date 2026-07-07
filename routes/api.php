<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\MotorController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\TransaksiController;
use App\Http\Controllers\Api\Admin\SupplierController;
use App\Http\Controllers\Api\Admin\KeuanganController;
use App\Http\Controllers\Api\Admin\ServisController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Public\KatalogController;
use App\Http\Controllers\Api\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Api\Customer\ProfilController;
use App\Http\Controllers\Api\Customer\WishlistController;
use App\Http\Controllers\Api\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Api\Customer\ServisController as CustomerServisController;
use Illuminate\Support\Facades\Route;

// ==================== AUTH ====================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// ==================== PUBLIK (tanpa login) ====================
Route::prefix('public')->group(function () {
    Route::get('/motors/unggulan', [KatalogController::class, 'unggulan']);
    Route::get('/motors', [KatalogController::class, 'index']);
    Route::get('/motors/{id}', [KatalogController::class, 'show']);
});

// ==================== ADMIN / INTERNAL ====================
Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:super_admin|admin|kasir|teknisi'])
    ->group(function () {

        // ---------- DASHBOARD ----------
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', [DashboardController::class, 'stats']);
            Route::get('/charts', [DashboardController::class, 'charts']);
            Route::get('/motor-belum-terjual', [DashboardController::class, 'motorBelumTerjual']);
            Route::get('/transaksi-terbaru', [DashboardController::class, 'transaksiTerbaru']);
            Route::get('/motor-terbaru', [DashboardController::class, 'motorTerbaru']);
        });

        // ---------- MOTOR ----------
        Route::apiResource('motors', MotorController::class);
        Route::patch('motors/{motor}/status', [MotorController::class, 'updateStatus']);
        Route::post('motors/{motor}/photos', [MotorController::class, 'uploadPhotos']);
        Route::patch('motors/{motor}/photos/{photoId}/primary', [MotorController::class, 'setPrimaryPhoto']);
        Route::delete('motors/{motor}/photos/{photoId}', [MotorController::class, 'deletePhoto']);

        // ---------- SUPPLIER ----------
        Route::apiResource('suppliers', SupplierController::class);

        // ---------- BOOKING MOTOR (Admin) ----------
        Route::prefix('bookings')->group(function () {
            Route::get('/', [AdminBookingController::class, 'index']);
            Route::get('/{id}', [AdminBookingController::class, 'show']);
            Route::get('/motor/{motorId}', [AdminBookingController::class, 'getByMotor']);
            Route::patch('/{id}/confirm', [AdminBookingController::class, 'confirm']);
            Route::patch('/{id}/complete', [AdminBookingController::class, 'complete']);
            Route::patch('/{id}/cancel', [AdminBookingController::class, 'cancel']);
                Route::get('/bookings/changes', [AdminBookingController::class, 'getChanges']);

        });

        // ---------- TRANSAKSI ----------
        Route::apiResource('transaksi', TransaksiController::class);
        Route::get('transaksi/{transaksi}/invoice', [TransaksiController::class, 'invoice']);

        // ---------- SERVIS (Booking Servis) ----------
        Route::apiResource('servis', ServisController::class);

        // ---------- CUSTOMER (Internal) ----------
        Route::prefix('customers')->group(function () {
            Route::get('/', [CustomerController::class, 'index']);
            Route::post('/', [CustomerController::class, 'store']);
            Route::get('/{id}', [CustomerController::class, 'show']);
            Route::put('/{id}', [CustomerController::class, 'update']);
            Route::delete('/{id}', [CustomerController::class, 'destroy']);
            Route::get('/{id}/bookings', [CustomerController::class, 'bookings']);
            Route::get('/{id}/transactions', [CustomerController::class, 'transactions']);
            Route::get('/{id}/servis', [CustomerController::class, 'servis']);
        });

        // ---------- KEUANGAN ----------
        Route::prefix('keuangan')
            ->middleware(['role:super_admin|admin|kasir'])
            ->group(function () {
                Route::get('/laba-rugi', [KeuanganController::class, 'labaRugi']);
                Route::get('/export-pdf', [KeuanganController::class, 'exportPdf']);
                Route::get('/export-excel', [KeuanganController::class, 'exportExcel']);
                Route::post('/pemasukan', [KeuanganController::class, 'tambahPemasukan']);
                Route::post('/pengeluaran', [KeuanganController::class, 'tambahPengeluaran']);
                Route::get('/pemasukan', [KeuanganController::class, 'getPemasukan']);
                Route::get('/pengeluaran', [KeuanganController::class, 'getPengeluaran']);
                Route::delete('/pemasukan/{id}', [KeuanganController::class, 'deletePemasukan']);
                Route::delete('/pengeluaran/{id}', [KeuanganController::class, 'deletePengeluaran']);
                Route::get('/riwayat-transaksi', [KeuanganController::class, 'riwayatTransaksi']);
            });

        // ---------- KELOLA USER (Hanya Super Admin) ----------
        Route::middleware('role:super_admin')->group(function () {
            Route::apiResource('users', UserController::class);
        });
    });

// ==================== CUSTOMER ====================
Route::prefix('customer')
    ->middleware(['auth:sanctum', 'role:customer'])
    ->group(function () {

        // ---------- DASHBOARD CUSTOMER ----------
        Route::get('/dashboard', [CustomerDashboardController::class, 'index']);

        // ---------- PROFIL ----------
        Route::get('/profil', [ProfilController::class, 'show']);
        Route::put('/profil', [ProfilController::class, 'update']);
        Route::post('/profil/avatar', [ProfilController::class, 'uploadAvatar']); 
        Route::delete('/profil/avatar', [ProfilController::class, 'deleteAvatar']);
        Route::post('/profil/change-password', [ProfilController::class, 'changePassword']);

        // ---------- WISHLIST ----------
        Route::prefix('wishlist')->group(function () {
            Route::get('/', [WishlistController::class, 'index']);
            Route::post('/toggle', [WishlistController::class, 'toggle']);
            Route::delete('/{id}', [WishlistController::class, 'destroy']);
            Route::get('/check/{motorId}', [WishlistController::class, 'check']);
        });

        // ---------- BOOKING (Customer) ----------
        Route::prefix('bookings')->group(function () {
            Route::get('/', [CustomerBookingController::class, 'index']);
            Route::post('/', [CustomerBookingController::class, 'store']);
            Route::get('/{id}', [CustomerBookingController::class, 'show']);
            Route::patch('/{id}/cancel', [CustomerBookingController::class, 'cancel']);
        });

        // ---------- SERVIS (Customer) ----------
        Route::prefix('servis')->group(function () {
            Route::get('/my-motors', [CustomerServisController::class, 'myMotors']);
            Route::get('/', [CustomerServisController::class, 'index']);
            Route::post('/', [CustomerServisController::class, 'store']);
            Route::get('/{id}', [CustomerServisController::class, 'show']);
        });
    });

// ==================== FALLBACK ====================
Route::fallback(function () {
    return response()->json([
        'message' => 'Endpoint tidak ditemukan. Silakan periksa URL Anda.'
    ], 404);
});