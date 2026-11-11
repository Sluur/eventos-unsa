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
            ['name' => 'Rodrigo Haro', 'email' => 'rodrigo@eventos.test', 'rol' => 'admin'],
            ['name' => 'Neo', 'email' => 'organizador@eventos.test', 'rol' => 'organizador'],
            ['name' => 'Oriana Figueroa', 'email' => 'oriana@eventos.test', 'rol' => 'alumno'],
            ['name' => 'Alejandro Haro', 'email' => 'alejandro@eventos.test', 'rol' => 'alumno'],
            ['name' => 'Franco Castilla', 'email' => 'franco@eventos.test', 'rol' => 'alumno'],
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
    }
}