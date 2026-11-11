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
            ['name' => 'Laura Gómez', 'email' => 'admin@eventos.test', 'rol' => 'admin'],
            ['name' => 'Martín Ríos', 'email' => 'organizador@eventos.test', 'rol' => 'organizador'],
            ['name' => 'Sofía Medina', 'email' => 'alumno@eventos.test', 'rol' => 'alumno'],
            ['name' => 'Tomás Herrera', 'email' => 'alumno2@eventos.test', 'rol' => 'alumno'],
            ['name' => 'Valentina Cruz', 'email' => 'valentina.cruz@eventos.test', 'rol' => 'alumno'],
            ['name' => 'Diego Paz', 'email' => 'diego.paz@eventos.test', 'rol' => 'alumno'],
            ['name' => 'Camila Ortiz', 'email' => 'camila.ortiz@eventos.test', 'rol' => 'alumno'],
            ['name' => 'Nicolás Vera', 'email' => 'nicolas.vera@eventos.test', 'rol' => 'alumno'],
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