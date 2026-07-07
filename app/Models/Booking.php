<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'motor_id',
        'user_id',
        'customer_id',
        'nama_pembeli',
        'no_hp',
        'alamat',
        'jenis_bayar',
        'tanggal_booking',
        'pesan',
        'status'
    ];

    protected $casts = [
        'tanggal_booking' => 'date',
    ];

    public function motor()
    {
        return $this->belongsTo(Motor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function transaksi()
    {
        return $this->hasOne(Transaksi::class);
    }

    // app/Models/Booking.php
public function logs()
{
    return $this->hasMany(BookingLog::class);
}
}