<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('servis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('motor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('nama_pelanggan');
            $table->string('no_hp');
            $table->text('alamat')->nullable();
            $table->string('jenis_servis');
            $table->text('keluhan')->nullable();
            $table->date('tanggal_servis');
            $table->date('estimasi_selesai')->nullable();
            $table->enum('status', ['menunggu', 'dikerjakan', 'selesai', 'batal'])->default('menunggu');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('servis');
    }
};