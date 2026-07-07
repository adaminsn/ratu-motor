<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $roles = ['super_admin', 'admin', 'sales', 'kasir', 'customer'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Migrasi role lama teknisi -> sales (jika ada dari seed sebelumnya)
        $oldTeknisi = Role::where('name', 'teknisi')->first();
        if ($oldTeknisi) {
            User::role('teknisi')->get()->each(fn (User $user) => $user->syncRoles(['sales']));
            $oldTeknisi->delete();
        }

        // Super Admin - Dwi Purnomo
        $dwi = User::updateOrCreate(
            ['email' => 'dwi@ratumotor.test'],
            [
                'name' => 'Dwi Purnomo',
                'password' => bcrypt('password'),
                'type' => 'admin',
                'no_hp' => '081234567890',
            ]
        );
        $dwi->syncRoles(['super_admin']);

        // Admin - Afrisal
        $afrisal = User::updateOrCreate(
            ['email' => 'afrisal@ratumotor.test'],
            [
                'name' => 'Afrisal',
                'password' => bcrypt('password'),
                'type' => 'admin',
                'no_hp' => '081234567891',
            ]
        );
        $afrisal->syncRoles(['admin']);

        // Sales - Durrahman
        $durrahman = User::updateOrCreate(
            ['email' => 'durrahman@ratumotor.test'],
            [
                'name' => 'Durrahman',
                'password' => bcrypt('password'),
                'type' => 'admin',
                'no_hp' => '081234567893',
            ]
        );
        $durrahman->syncRoles(['sales']);

        // Kasir - Iyut
        $iyut = User::updateOrCreate(
            ['email' => 'iyut@ratumotor.test'],
            [
                'name' => 'Iyut',
                'password' => bcrypt('password'),
                'type' => 'admin',
                'no_hp' => '081234567892',
            ]
        );
        $iyut->syncRoles(['kasir']);

        // Customer - Budi
        $budi = User::updateOrCreate(
            ['email' => 'budi@ratumotor.test'],
            [
                'name' => 'Budi Customer',
                'password' => bcrypt('password'),
                'type' => 'customer',
                'no_hp' => '081234567894',
            ]
        );
        $budi->syncRoles(['customer']);

        // Customer - Adam (Dari prompt user)
        $adam = User::updateOrCreate(
            ['email' => 'adam@tes.com'],
            [
                'name' => 'Adam',
                'password' => bcrypt('password'),
                'type' => 'customer',
                'no_hp' => '081234567895',
            ]
        );
        $adam->syncRoles(['customer']);

        $this->command->newLine();
        $this->command->info('[OK] Roles dan Users berhasil dibuat!');
        $this->command->line('  Super Admin : dwi@ratumotor.test / password');
        $this->command->line('  Admin       : afrisal@ratumotor.test / password');
        $this->command->line('  Sales       : durrahman@ratumotor.test / password');
        $this->command->line('  Kasir       : iyut@ratumotor.test / password');
        $this->command->line('  Customer    : budi@ratumotor.test / password');
        $this->command->newLine();
    }
}
