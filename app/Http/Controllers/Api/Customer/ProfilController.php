<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfilController extends Controller
{
    public function show()
    {
        $user = Auth::user()->load('roles');
        return response()->json([
            'user' => $user
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name'                  => 'required|string|max:255',
            'no_hp'                 => 'nullable|string|max:20',
            'alamat'                => 'nullable|string|max:500',
        ]);

        $user->name  = $request->name;
        $user->no_hp = $request->no_hp;
        $user->alamat = $request->alamat;

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user'    => $user->load('roles')
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        try {
            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
            ], [
                'avatar.required' => 'Silakan pilih foto terlebih dahulu',
                'avatar.image' => 'File harus berupa gambar',
                'avatar.mimes' => 'Format foto harus jpeg, png, jpg, atau webp',
                'avatar.max' => 'Ukuran foto maksimal 2MB'
            ]);

            $user = Auth::user();
            
            // Hapus avatar lama jika ada
            if ($user->avatar) {
                $oldPath = str_replace('storage/', '', $user->avatar);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            
            // Upload avatar baru
            $file = $request->file('avatar');
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars', $fileName, 'public');
            
            // Update user avatar
            $user->avatar = 'storage/' . $path;
            $user->save();

            // Refresh user dengan load roles
            $user = Auth::user()->load('roles');

            return response()->json([
                'success' => true,
                'message' => 'Foto profil berhasil diupload',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteAvatar()
    {
        $user = Auth::user();
        
        if (!$user->avatar) {
            return response()->json([
                'message' => 'Tidak ada foto profil'
            ], 404);
        }

        $oldPath = str_replace('storage/', '', $user->avatar);
        if (Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }
        
        $user->avatar = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil dihapus',
            'user' => $user->load('roles')
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string|min:6',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password berhasil diubah'
        ]);
    }
}