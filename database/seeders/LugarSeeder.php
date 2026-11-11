<?php

namespace Database\Seeders;

use App\Models\Lugar;
use Illuminate\Database\Seeder;

class LugarSeeder extends Seeder
{
    public function run(): void
    {
        $lugares = [
            ['nombre' => 'Aula Magna', 'direccion' => 'Edificio central, planta baja', 'capacidad' => 200],
            ['nombre' => 'Aula 101', 'direccion' => 'Edificio de Aulas, 1er piso', 'capacidad' => 60],
            ['nombre' => 'Laboratorio de Informática 1', 'direccion' => 'Facultad de Ciencias Exactas', 'capacidad' => 30],
        ];

        foreach ($lugares as $lugar) {
            Lugar::create($lugar);
        }
    }
}
