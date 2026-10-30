<?php

namespace Database\Factories;

use App\Models\Categoria;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventoFactory extends Factory
{
    public function definition(): array
    {
        $inicio = fake()->dateTimeBetween('-2 months', '+2 months');
        $inicio->setTime(fake()->numberBetween(9, 19), 0);
        $fin = (clone $inicio)->modify('+2 hours');

        return [
            'titulo' => fake()->randomElement([
                'Introducción a la Inteligencia Artificial',
                'Taller de Git y GitHub',
                'Ciberseguridad para principiantes',
                'Desarrollo web con Laravel',
                'Bases de datos en la nube',
                'Primeros pasos en React',
                'Metodologías ágiles en equipos reales',
                'Cómo armar tu CV en tecnología',
                'Jornada de emprendedurismo',
                'Robótica educativa',
                'Análisis de datos con Python',
                'Experiencias de graduados en la industria',
            ]),
            'descripcion' => fake()->randomElement([
                'Actividad abierta a estudiantes de todas las carreras. Se entregará certificado de asistencia.',
                'Encuentro con modalidad práctica. Se recomienda llevar notebook.',
                'Charla introductoria, no se requieren conocimientos previos.',
                'Actividad organizada junto al Centro de Estudiantes.',
            ]),
            'fecha_inicio' => $inicio,
            'fecha_fin' => $fin,
            'cupo' => fake()->randomElement([20, 30, 50, 80, 100]),
            'estado' => $inicio < now() ? 'finalizado' : 'publicado',
            'categoria_id' => Categoria::inRandomOrder()->value('id'),
            'lugar_id' => Lugar::inRandomOrder()->value('id'),
            'organizador_id' => User::role('organizador')->inRandomOrder()->value('id'),
        ];
    }
}