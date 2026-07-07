// database/migrations/2026_07_07_xxxxxx_add_tanggal_booking_to_bookings_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Cek apakah kolom tanggal_booking sudah ada
            if (!Schema::hasColumn('bookings', 'tanggal_booking')) {
                $table->date('tanggal_booking')->nullable()->after('jenis_bayar');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'tanggal_booking')) {
                $table->dropColumn('tanggal_booking');
            }
        });
    }
};