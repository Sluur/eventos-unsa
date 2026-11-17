<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            [
                'nombre' => 'Charla',
                'descripcion' => 'Exposición breve sobre un tema.',
                'color' => '#4f7f8f',
            ],
            [
                'nombre' => 'Taller',
                'descripcion' => 'Actividad práctica con participación.',
                'requiere_aprobacion' => true,
                'color' => '#8c6d46',
            ],
            [
                'nombre' => 'Curso',
                'descripcion' => 'Formación de varios encuentros.',
                'requiere_aprobacion' => true,
                'requiere_documentacion' => true,
                'documentacion_descripcion' => 'Certificado de alumno regular',
                'color' => '#5e7a64',
            ],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
