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
        $taller = Categoria::where('nombre', 'Taller')->value('id');

        // Queda un solo lugar libre
        $inicio = now()->addDays(7)->setTime(18, 0);

        $git = Evento::create([
            'titulo' => 'Git y GitHub para trabajos en grupo',
            'descripcion' => 'Ramas, commits y pull requests para trabajar ordenados en equipo.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 2,
            'estado' => 'publicado',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula 101')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $git->disertantes()->attach(Disertante::where('email', 'diego@eventos.test')->pluck('id'));
        $this->inscribir($git, ['franco@eventos.test']);

        // Ya pasó y falta tomar asistencia
        $inicio = now()->subDays(2)->setTime(18, 0);

        $sql = Evento::create([
            'titulo' => 'Introducción a SQL',
            'descripcion' => 'Consultas básicas para leer y filtrar datos de una base relacional.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 30,
            'estado' => 'publicado',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula 101')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $sql->disertantes()->attach(Disertante::where('email', 'carlos@eventos.test')->pluck('id'));
        $this->inscribir($sql, ['oriana@eventos.test', 'alejandro@eventos.test', 'franco@eventos.test']);

        $inicio = now()->addDays(14)->setTime(17, 0);

        $redes = Evento::create([
            'titulo' => 'Cómo funciona Internet',
            'descripcion' => 'Un recorrido simple por redes, direcciones IP y DNS. No hace falta saber nada previo.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 30,
            'estado' => 'publicado',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula Magna')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $redes->disertantes()->attach(Disertante::where('email', 'cristian@eventos.test')->pluck('id'));
        $this->inscribir($redes, ['oriana@eventos.test']);

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
        $api->disertantes()->attach(Disertante::whereIn('email', ['diego@eventos.test', 'carlos@eventos.test'])->pluck('id'));

        $inicio = now()->subDays(20)->setTime(16, 0);

        $linux = Evento::create([
            'titulo' => 'Taller de Linux desde cero',
            'descripcion' => 'Instalamos Linux y practicamos los comandos básicos de la terminal.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(3),
            'cupo' => 20,
            'estado' => 'finalizado',
            'categoria_id' => $taller,
            'lugar_id' => Lugar::where('nombre', 'Laboratorio de Informática 1')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $linux->disertantes()->attach(Disertante::whereIn('email', ['cristian@eventos.test', 'diego@eventos.test'])->pluck('id'));
        $this->inscribir($linux, ['alejandro@eventos.test', 'franco@eventos.test'], asistio: true);
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
