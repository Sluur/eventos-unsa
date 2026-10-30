<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DisertanteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->firstName(),
            'apellido' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'biografia' => fake()->randomElement([
                'Docente e investigador de la universidad.',
                'Profesional con experiencia en la industria del software.',
                'Especialista invitado de otra institución.',
                'Graduado de la casa, actualmente trabaja en el sector público.',
            ]),
        ];
    }
}