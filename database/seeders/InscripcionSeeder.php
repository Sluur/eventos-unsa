<?php

namespace Database\Seeders;

use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\User;
use Illuminate\Database\Seeder;

class InscripcionSeeder extends Seeder
{
    public function run(): void
    {
        $alumnos = User::role('alumno')->pluck('id');

        foreach (Evento::all() as $evento) {
            $cantidad = min($evento->cupo, rand(5, 25), $alumnos->count());

            foreach ($alumnos->random($cantidad) as $alumnoId) {
                Inscripcion::create([
                    'user_id' => $alumnoId,
                    'evento_id' => $evento->id,
                    'estado' => 'confirmada',
                    'asistio' => $evento->estado === 'finalizado' && fake()->boolean(75),
                ]);
            }
        }
    }
}