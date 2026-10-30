<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Charla', 'descripcion' => 'Exposición breve sobre un tema.'],
            ['nombre' => 'Taller', 'descripcion' => 'Actividad práctica con participación.'],
            ['nombre' => 'Congreso', 'descripcion' => 'Evento con varias exposiciones.'],
            ['nombre' => 'Jornada', 'descripcion' => 'Actividades durante un día completo.'],
            ['nombre' => 'Curso', 'descripcion' => 'Formación de varios encuentros.'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
