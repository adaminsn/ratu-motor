<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Hapus kolom hanya jika ada
            if (Schema::hasColumn('bookings', 'nama_pembeli')) {
                $table->dropColumn('nama_pembeli');
            }
            if (Schema::hasColumn('bookings', 'no_hp')) {
                $table->dropColumn('no_hp');
            }
            if (Schema::hasColumn('bookings', 'alamat')) {
                $table->dropColumn('alamat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Kembalikan kolom jika rollback
            if (!Schema::hasColumn('bookings', 'nama_pembeli')) {
                $table->string('nama_pembeli')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('bookings', 'no_hp')) {
                $table->string('no_hp')->nullable()->after('nama_pembeli');
            }
            if (!Schema::hasColumn('bookings', 'alamat')) {
                $table->text('alamat')->nullable()->after('no_hp');
            }
        });
    }
};