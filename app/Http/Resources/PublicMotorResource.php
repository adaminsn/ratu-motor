<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PublicMotorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'merk' => $this->merk,
            'tipe' => $this->tipe,
            'tahun' => $this->tahun,
            'warna' => $this->warna,
            'kondisi' => $this->kondisi,
            'harga_jual' => $this->harga_jual,
            'status' => $this->status,
            'photos' => $this->photos->map(function ($photo) {
                return [
                    'id' => $photo->id,
                    'url' => Storage::disk('public')->url($photo->photo_path),
                    'is_primary' => $photo->is_primary,
                ];
            }),
        ];
    }
}