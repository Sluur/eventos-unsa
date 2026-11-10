<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Disertante;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoCharlaSeeder extends Seeder
{
    public function run(): void
    {
        $organizador = User::where('email', 'organizador@eventos.test')->firstOrFail();
        $alumno = User::where('email', 'alumno@eventos.test')->firstOrFail();
        $charla = Categoria::where('nombre', 'Charla')->firstOrFail();

        // Segundo alumno de prueba para mostrar que ya no hay cupo
        $alumno2 = User::firstOrCreate(
            ['email' => 'alumno2@eventos.test'],
            [
                'name' => 'Lucía Alumna',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $alumno2->assignRole('alumno');

        $otrosAlumnos = User::role('alumno')
            ->whereNotIn('id', [$alumno->id, $alumno2->id])
            ->inRandomOrder()
            ->limit(10)
            ->get();

        // Charla futura con un solo lugar libre
        $inicio = now()->addDays(7)->setTime(18, 0);

        $futura = Evento::create([
            'titulo' => 'Introducción a Docker para estudiantes',
            'descripcion' => "Vamos a ver qué son los contenedores, para qué sirven y cómo levantar un proyecto con Docker.\nSe recomienda llevar notebook.",
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 5,
            'estado' => 'publicado',
            'categoria_id' => $charla->id,
            'lugar_id' => Lugar::where('nombre', 'Laboratorio de Informática 1')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $futura->disertantes()->attach(Disertante::inRandomOrder()->limit(2)->pluck('id'));

        foreach ($otrosAlumnos->take(4) as $otro) {
            Inscripcion::create([
                'user_id' => $otro->id,
                'evento_id' => $futura->id,
                'estado' => 'confirmada',
            ]);
        }

        // Charla que ya pasó, con la asistencia sin tomar
        $inicio = now()->subDays(2)->setTime(18, 0);

        $pasada = Evento::create([
            'titulo' => 'Buenas prácticas con Git en equipo',
            'descripcion' => 'Ramas, commits y pull requests: cómo trabajar ordenados cuando el proyecto es de varios.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 30,
            'estado' => 'publicado',
            'categoria_id' => $charla->id,
            'lugar_id' => Lugar::where('nombre', 'Aula 101')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $pasada->disertantes()->attach(Disertante::inRandomOrder()->limit(1)->pluck('id'));

        foreach ($otrosAlumnos->slice(2)->push($alumno) as $inscripto) {
            Inscripcion::create([
                'user_id' => $inscripto->id,
                'evento_id' => $pasada->id,
                'estado' => 'confirmada',
            ]);
        }
    }
}
