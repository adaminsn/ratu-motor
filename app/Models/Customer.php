<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'email',
        'no_hp',
        'alamat',
        'nik',
    ];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class, 'customer_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function servis()
    {
        return $this->hasMany(Servis::class, 'customer_id');
    }
}