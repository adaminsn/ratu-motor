// app/Helpers/FileHelper.php
<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class FileHelper
{
    public static function sanitizeFileName($fileName)
    {
        // Hapus spasi, ganti dengan underscore
        $fileName = str_replace(' ', '_', $fileName);
        
        // Hapus karakter khusus
        $fileName = preg_replace('/[^A-Za-z0-9\-_\.]/', '', $fileName);
        
        // Tambahkan timestamp
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        $name = pathinfo($fileName, PATHINFO_FILENAME);
        
        return time() . '_' . $name . '.' . $extension;
    }
}