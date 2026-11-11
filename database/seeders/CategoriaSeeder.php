<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Charla', 'descripcion' => 'Exposición breve sobre un tema.'],
            ['nombre' => 'Taller', 'descripcion' => 'Actividad práctica con participación.'],
            ['nombre' => 'Curso', 'descripcion' => 'Formación de varios encuentros.'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
