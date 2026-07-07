<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $fillable = [
        'booking_id',
        'motor_id',
        'customer_id',
        'user_id',
        'tanggal_transaksi',
        'harga_kesepakatan',
        'metode_pembayaran',
        'status_pembayaran',
        'keterangan',
        'no_invoice'
    ];

    protected $casts = [
        'tanggal_transaksi' => 'date',
        'harga_kesepakatan' => 'decimal:2',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function motor()
    {
        return $this->belongsTo(Motor::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pemasukan()
    {
        return $this->hasOne(Pemasukan::class);
    }
}