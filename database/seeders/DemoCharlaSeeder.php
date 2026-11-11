<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Disertante;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoCharlaSeeder extends Seeder
{
    public function run(): void
    {
        $organizador = User::where('email', 'organizador@eventos.test')->firstOrFail();
        $charla = Categoria::where('nombre', 'Charla')->value('id');

        // Queda un solo lugar libre
        $inicio = now()->addDays(7)->setTime(18, 0);

        $futura = Evento::create([
            'titulo' => 'Introducción a Docker para estudiantes',
            'descripcion' => 'Qué son los contenedores y cómo levantar un proyecto con Docker. Se recomienda llevar notebook.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 5,
            'estado' => 'publicado',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Laboratorio 1')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $futura->disertantes()->attach(Disertante::whereIn('apellido', ['Sosa', 'Villalba'])->pluck('id'));

        $this->inscribir($futura, [
            'valentina.cruz@eventos.test',
            'diego.paz@eventos.test',
            'camila.ortiz@eventos.test',
            'nicolas.vera@eventos.test',
        ]);

        // Ya pasó y falta tomar asistencia
        $inicio = now()->subDays(2)->setTime(18, 0);

        $pasada = Evento::create([
            'titulo' => 'Buenas prácticas con Git en equipo',
            'descripcion' => 'Ramas, commits y pull requests para trabajar ordenados en grupo.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 30,
            'estado' => 'publicado',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula 101')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $pasada->disertantes()->attach(Disertante::where('apellido', 'Sosa')->pluck('id'));

        $this->inscribir($pasada, [
            'alumno@eventos.test',
            'camila.ortiz@eventos.test',
            'nicolas.vera@eventos.test',
        ]);
    }

    private function inscribir(Evento $evento, array $emails): void
    {
        foreach (User::whereIn('email', $emails)->pluck('id') as $userId) {
            Inscripcion::create([
                'user_id' => $userId,
                'evento_id' => $evento->id,
                'estado' => 'confirmada',
            ]);
        }
    }
}
