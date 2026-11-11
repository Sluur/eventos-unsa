<?php

namespace Database\Seeders;

use App\Models\Disertante;
use Illuminate\Database\Seeder;

class DisertanteSeeder extends Seeder
{
    public function run(): void
    {
        $disertantes = [
            [
                'nombre' => 'Diego',
                'apellido' => 'Rodríguez',
                'email' => 'diego@eventos.test',
                'biografia' => 'Profesor de Programación en la carrera de Informática.',
            ],
            [
                'nombre' => 'Carlos',
                'apellido' => 'Nocera',
                'email' => 'carlos@eventos.test',
                'biografia' => 'Profesor de Bases de Datos y desarrollador backend.',
            ],
            [
                'nombre' => 'Cristian',
                'apellido' => 'Martínez',
                'email' => 'cristian@eventos.test',
                'biografia' => 'Profesor de Redes y administrador de sistemas.',
            ],
        ];

        foreach ($disertantes as $disertante) {
            Disertante::create($disertante);
        }
    }
}
