<?php

namespace Database\Seeders;

use App\Models\Lugar;
use Illuminate\Database\Seeder;

class LugarSeeder extends Seeder
{
    public function run(): void
    {
        $lugares = [
            ['nombre' => 'Aula 8', 'direccion' => 'Edificio de Aulas, planta baja', 'capacidad' => 40],
            ['nombre' => 'Aula 101', 'direccion' => 'Edificio de Aulas, 1er piso', 'capacidad' => 60],
            ['nombre' => 'Laboratorio 1', 'direccion' => 'Facultad de Ciencias Exactas', 'capacidad' => 30],
        ];

        foreach ($lugares as $lugar) {
            Lugar::create($lugar);
        }
    }
}
