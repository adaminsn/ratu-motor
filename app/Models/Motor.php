<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Image\Enums\Fit;

class Motor extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'supplier_id',
        'merk',
        'tipe',
        'tahun',
        'warna',
        'kondisi',
        'no_rangka',
        'no_mesin',
        'no_polisi',
        'bpkb',
        'harga_beli',
        'harga_jual',
        'harga_minimal',
        'status',
        'tanggal_masuk',
    ];

    protected function casts(): array
    {
        return [
            'harga_beli' => 'decimal:2',
            'harga_jual' => 'decimal:2',
            'harga_minimal' => 'decimal:2',
            'tanggal_masuk' => 'date',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MotorPhoto::class);
    }

    public function primaryPhoto(): HasMany
    {
        return $this->photos()->where('is_primary', true);
    }

    // ===== SPATIE MEDIA LIBRARY =====

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('foto_motor')
            ->useFallbackUrl('/images/motor-placeholder.png');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // Thumbnail kecil — dipakai di list/tabel, super ringan
        $this->addMediaConversion('thumb')
            ->fit(Fit::Crop, 300, 300)
            ->quality(75)
            ->nonQueued();

        // Ukuran medium — dipakai di detail/gallery
        $this->addMediaConversion('medium')
            ->fit(Fit::Contain, 800, 800)
            ->quality(80)
            ->nonQueued();
    }

    public function bookings(): HasMany
{
    return $this->hasMany(Booking::class);
}
}