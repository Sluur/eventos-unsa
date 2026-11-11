<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Disertante;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventoSeeder extends Seeder
{
    public function run(): void
    {
        $organizador = User::where('email', 'organizador@eventos.test')->firstOrFail();
        $charla = Categoria::where('nombre', 'Charla')->value('id');
        $taller = Categoria::where('nombre', 'Taller')->value('id');

        $inicio = now()->addDays(14)->setTime(17, 0);

        $cv = Evento::create([
            'titulo' => 'Cómo armar tu CV para la primera pasantía',
            'descripcion' => 'Consejos para preparar el CV y la primera entrevista laboral.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 40,
            'estado' => 'publicado',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula 8')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $cv->disertantes()->attach(Disertante::where('apellido', 'Villalba')->pluck('id'));
        $this->inscribir($cv, ['alumno2@eventos.test', 'valentina.cruz@eventos.test']);

        $inicio = now()->addDays(30)->setTime(18, 0);

        $api = Evento::create([
            'titulo' => 'Introducción a las APIs REST',
            'descripcion' => 'Qué es una API REST y cómo consumirla desde una aplicación web.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 30,
            'estado' => 'borrador',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula 101')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $api->disertantes()->attach(Disertante::where('apellido', 'Sosa')->pluck('id'));

        $inicio = now()->subDays(20)->setTime(16, 0);

        $html = Evento::create([
            'titulo' => 'Taller de HTML y CSS desde cero',
            'descripcion' => 'Armamos una página simple paso a paso. Traer notebook.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(3),
            'cupo' => 20,
            'estado' => 'finalizado',
            'categoria_id' => $taller,
            'lugar_id' => Lugar::where('nombre', 'Laboratorio 1')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $html->disertantes()->attach(Disertante::where('apellido', 'Mendoza')->pluck('id'));
        $this->inscribir($html, ['alumno@eventos.test', 'alumno2@eventos.test', 'diego.paz@eventos.test'], asistio: true);
        $this->inscribir($html, ['valentina.cruz@eventos.test']);
    }

    private function inscribir(Evento $evento, array $emails, bool $asistio = false): void
    {
        foreach (User::whereIn('email', $emails)->pluck('id') as $userId) {
            Inscripcion::create([
                'user_id' => $userId,
                'evento_id' => $evento->id,
                'estado' => 'confirmada',
                'asistio' => $asistio,
            ]);
        }
    }
}
