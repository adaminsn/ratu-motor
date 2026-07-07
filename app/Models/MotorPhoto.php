<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MotorPhoto extends Model
{
    protected $fillable = [
        'motor_id',
        'photo_path',
        'is_primary',
    ];

    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    public function motor(): BelongsTo
    {
        return $this->belongsTo(Motor::class);
    }

    public function getPhotoUrlAttribute()
    {
        if (str_starts_with($this->photo_path, 'http')) {
            return $this->photo_path;
        }
        return Storage::disk('public')->url($this->photo_path);
    }
}