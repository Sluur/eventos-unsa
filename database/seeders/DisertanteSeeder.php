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
                'nombre' => 'Andrea',
                'apellido' => 'Villalba',
                'email' => 'andrea.villalba@unsa.test',
                'biografia' => 'Docente de la carrera de Informática.',
            ],
            [
                'nombre' => 'Ricardo',
                'apellido' => 'Sosa',
                'email' => 'ricardo.sosa@unsa.test',
                'biografia' => 'Desarrollador backend, graduado de la facultad.',
            ],
            [
                'nombre' => 'Paula',
                'apellido' => 'Mendoza',
                'email' => 'paula.mendoza@unsa.test',
                'biografia' => 'Diseñadora web y ayudante de cátedra.',
            ],
        ];

        foreach ($disertantes as $disertante) {
            Disertante::create($disertante);
        }
    }
}
