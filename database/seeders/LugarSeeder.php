<?php

namespace Database\Seeders;

use App\Models\Lugar;
use Illuminate\Database\Seeder;

class LugarSeeder extends Seeder
{
    public function run(): void
    {
        $lugares = [
            ['nombre' => 'Aula Magna', 'direccion' => 'Edificio Central, planta baja', 'capacidad' => 300],
            ['nombre' => 'Anfiteatro A', 'direccion' => 'Edificio de Aulas, 1er piso', 'capacidad' => 150],
            ['nombre' => 'Laboratorio de Informática 1', 'direccion' => 'Facultad de Ciencias Exactas', 'capacidad' => 30],
            ['nombre' => 'Aula 101', 'direccion' => 'Edificio de Aulas, planta baja', 'capacidad' => 60],
            ['nombre' => 'Salón de Usos Múltiples', 'direccion' => 'Centro de Estudiantes', 'capacidad' => 100],
        ];

        foreach ($lugares as $lugar) {
            Lugar::create($lugar);
        }
    }
}