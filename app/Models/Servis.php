<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Servis extends Model
{
    // Tidak pakai SoftDeletes karena migration tidak ada deleted_at
    // use SoftDeletes;

    protected $table = 'servis';

    protected $fillable = [
        'motor_id',
        'user_id',
        'customer_id',
        'nama_pelanggan',
        'no_hp',
        'alamat',
        'jenis_servis',
        'keluhan',
        'tanggal_servis',
        'estimasi_selesai',
        'status',
        'catatan'
    ];

    protected $casts = [
        'tanggal_servis' => 'date',
        'estimasi_selesai' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Status constants
    const STATUS_MENUNGGU = 'menunggu';
    const STATUS_DIKERJAKAN = 'dikerjakan';
    const STATUS_SELESAI = 'selesai';
    const STATUS_BATAL = 'batal';

    public static function getStatuses()
    {
        return [
            self::STATUS_MENUNGGU => 'Menunggu',
            self::STATUS_DIKERJAKAN => 'Dikerjakan',
            self::STATUS_SELESAI => 'Selesai',
            self::STATUS_BATAL => 'Batal',
        ];
    }

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

    // Scope untuk filter status
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope untuk servis aktif
    public function scopeAktif($query)
    {
        return $query->whereIn('status', [self::STATUS_MENUNGGU, self::STATUS_DIKERJAKAN]);
    }

    // Scope untuk servis selesai
    public function scopeSelesai($query)
    {
        return $query->where('status', self::STATUS_SELESAI);
    }
}