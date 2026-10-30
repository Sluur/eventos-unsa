<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permisos = [
            'gestionar categorias',
            'gestionar lugares',
            'gestionar disertantes',
            'listar eventos',
            'crear eventos',
            'editar eventos',
            'eliminar eventos',
            'inscribirse eventos',
            'tomar asistencia',
            'descargar reportes',
            'ver dashboard',
        ];

        foreach ($permisos as $permiso) {
            Permission::create(['name' => $permiso]);
        }

        $admin = Role::create(['name' => 'admin']);
        $organizador = Role::create(['name' => 'organizador']);
        $alumno = Role::create(['name' => 'alumno']);

        $admin->givePermissionTo(Permission::all());

        $organizador->givePermissionTo([
            'gestionar disertantes',
            'listar eventos',
            'crear eventos',
            'editar eventos',
            'eliminar eventos',
            'tomar asistencia',
            'descargar reportes',
        ]);

        $alumno->givePermissionTo([
            'listar eventos',
            'inscribirse eventos',
            'descargar reportes',
        ]);

     
        $usuarios = [
            ['name' => 'Administrador', 'email' => 'admin@eventos.test', 'rol' => 'admin'],
            ['name' => 'María Organizadora', 'email' => 'organizador@eventos.test', 'rol' => 'organizador'],
            ['name' => 'Juan Alumno', 'email' => 'alumno@eventos.test', 'rol' => 'alumno'],
        ];

        foreach ($usuarios as $datos) {
            User::firstOrCreate(
                ['email' => $datos['email']],
                [
                    'name' => $datos['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            )->assignRole($datos['rol']);
        }

        User::factory()->count(2)->create()->each(fn ($u) => $u->assignRole('organizador'));
        User::factory()->count(30)->create()->each(fn ($u) => $u->assignRole('alumno'));
    }
}