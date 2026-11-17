<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            // Inscripción directa
            [
                'nombre' => 'Charla',
                'descripcion' => 'Exposición breve sobre un tema.',
                'color' => '#059669',
            ],
            // El organizador aprueba cada inscripción
            [
                'nombre' => 'Taller',
                'descripcion' => 'Actividad práctica con participación.',
                'requiere_aprobacion' => true,
                'color' => '#0284c7',
            ],
            // Además hay que presentar documentación
            [
                'nombre' => 'Curso',
                'descripcion' => 'Formación de varios encuentros.',
                'requiere_aprobacion' => true,
                'requiere_documentacion' => true,
                'documentacion_descripcion' => 'Certificado de alumno regular',
                'color' => '#7c3aed',
            ],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
