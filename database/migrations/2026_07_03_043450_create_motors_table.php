<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('motors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();

            $table->string('merk');
            $table->string('tipe');
            $table->year('tahun');
            $table->string('warna');
            $table->enum('kondisi', ['baru', 'bekas']);

            $table->string('no_rangka')->unique();
            $table->string('no_mesin')->unique();
            $table->string('no_polisi')->nullable();
            $table->string('bpkb')->nullable(); // nomor BPKB — tampil ke customer setelah transaksi selesai

            $table->decimal('harga_beli', 15, 2);
            $table->decimal('harga_jual', 15, 2);
            $table->decimal('harga_minimal', 15, 2)->nullable();

            $table->enum('status', ['tersedia', 'reserved', 'terjual'])->default('tersedia');

            $table->date('tanggal_masuk');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('motors');
    }
};