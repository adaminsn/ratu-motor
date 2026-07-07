<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'no_hp',
        'alamat',
        'keterangan',
        'jumlah_motor', // ← TAMBAHKAN INI
    ];

    public function motors(): HasMany
    {
        return $this->hasMany(Motor::class);
    }

    // ===== ACCESSOR =====
    // Mendapatkan total nilai pembelian dari semua motor supplier
    public function getTotalPembelianAttribute()
    {
        return $this->motors()->sum('harga_beli');
    }

    // Mendapatkan formatted jumlah motor
    public function getJumlahMotorFormattedAttribute()
    {
        return $this->jumlah_motor . ' Unit';
    }

    // ===== SCOPES =====
    // Scope untuk supplier dengan motor terbanyak
    public function scopeWithMostMotors($query)
    {
        return $query->orderBy('jumlah_motor', 'desc');
    }

    // Scope untuk supplier dengan motor minimal
    public function scopeWithMinMotors($query, $min = 1)
    {
        return $query->where('jumlah_motor', '>=', $min);
    }

    // ===== HELPER =====
    // Cek apakah supplier memiliki motor
    public function hasMotors(): bool
    {
        return $this->jumlah_motor > 0;
    }

    // Tambah jumlah motor
    public function addMotors(int $count): self
    {
        $this->jumlah_motor += $count;
        $this->save();
        return $this;
    }

    // Kurangi jumlah motor
    public function removeMotors(int $count): self
    {
        $this->jumlah_motor = max(0, $this->jumlah_motor - $count);
        $this->save();
        return $this;
    }
}