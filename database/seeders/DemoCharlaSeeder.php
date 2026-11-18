<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Disertante;
use App\Models\Encuesta;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DemoCharlaSeeder extends Seeder
{
    public function run(): void
    {
        $organizador = User::where('email', 'organizador@eventos.test')->firstOrFail();
        $charla = Categoria::where('nombre', 'Charla')->value('id');
        $taller = Categoria::where('nombre', 'Taller')->value('id');

        $inicio = now()->addDays(7)->setTime(18, 0);

        $git = Evento::create([
            'titulo' => 'Git y GitHub para trabajos en grupo',
            'descripcion' => 'Ramas, commits y pull requests para trabajar ordenados en equipo.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'inscripcion_hasta' => (clone $inicio)->subDay(),
            'cupo' => 4,
            'solo_registrados' => false,
            'estado' => 'publicado',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula 101')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $git->disertantes()->attach(Disertante::where('email', 'diego@eventos.test')->pluck('id'));
        $this->inscribir($git, ['franco@eventos.test']);

        foreach ([
            ['Lucía', 'Gómez', 'lucia.gomez@example.com', '40123456'],
            ['Martín', 'Ríos', 'martin.rios@example.com', '41234567'],
        ] as [$nombre, $apellido, $email, $dni]) {
            Inscripcion::create([
                'evento_id' => $git->id,
                'nombre_invitado' => $nombre,
                'apellido_invitado' => $apellido,
                'email_invitado' => $email,
                'dni_invitado' => $dni,
                'estado' => 'confirmada',
            ]);
        }

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
        $this->inscribir($sql, ['oriana@eventos.test', 'franco@eventos.test']);
        $this->inscribir($sql, ['alejandro@eventos.test'], asistio: true);

        $inicio = now()->addDays(14)->setTime(17, 0);

        $redes = Evento::create([
            'titulo' => 'Cómo funciona Internet',
            'descripcion' => 'Un recorrido simple por redes, direcciones IP y DNS. No hace falta saber nada previo.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'inscripcion_hasta' => now()->subDay()->setTime(23, 59),
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

        Encuesta::create([
            'inscripcion_id' => Inscripcion::where('evento_id', $linux->id)
                ->whereRelation('user', 'email', 'alejandro@eventos.test')
                ->value('id'),
            'puntaje' => 5,
            'comentario' => 'Muy práctico, los ejercicios en la terminal ayudaron mucho.',
        ]);

        $inicio = now()->subDays(40)->setTime(17, 0);

        $arduino = Evento::create([
            'titulo' => 'Primeros pasos con Arduino',
            'descripcion' => 'Armamos circuitos simples y programamos sensores con una placa Arduino.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 12,
            'estado' => 'finalizado',
            'categoria_id' => $taller,
            'lugar_id' => Lugar::where('nombre', 'Laboratorio de Informática 1')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $arduino->disertantes()->attach(Disertante::where('email', 'cristian@eventos.test')->pluck('id'));
        $this->inscribir($arduino, ['alejandro@eventos.test', 'franco@eventos.test'], asistio: true);
        $this->inscribir($arduino, ['oriana@eventos.test']);

        Inscripcion::create([
            'evento_id' => $arduino->id,
            'nombre_invitado' => 'Sofía',
            'apellido_invitado' => 'Paz',
            'email_invitado' => 'sofia.paz@example.com',
            'dni_invitado' => '42345678',
            'estado' => 'confirmada',
            'asistio' => false,
        ]);

        $inicio = now()->addDays(10)->setTime(18, 0);

        $seguridad = Evento::create([
            'titulo' => 'Seguridad informática básica',
            'descripcion' => 'Contraseñas, phishing y cómo cuidar tus cuentas.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 30,
            'estado' => 'cancelado',
            'motivo_cancelacion' => 'El disertante no puede viajar esa semana. La vamos a reprogramar el próximo cuatrimestre.',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula Magna')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $seguridad->disertantes()->attach(Disertante::where('email', 'cristian@eventos.test')->pluck('id'));
        $this->inscribir($seguridad, ['oriana@eventos.test', 'alejandro@eventos.test']);

        // tiene que caer en las proximas 24 horas para mostrar el recordatorio
        $inicio = now()->hour < 10 ? now()->setTime(18, 0) : now()->addDay()->setTime(10, 0);

        $docker = Evento::create([
            'titulo' => 'Primeros pasos con Docker',
            'descripcion' => 'Contenedores e imágenes explicados con ejemplos simples.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(2),
            'cupo' => 25,
            'estado' => 'publicado',
            'categoria_id' => $charla,
            'lugar_id' => Lugar::where('nombre', 'Aula 101')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $docker->disertantes()->attach(Disertante::where('email', 'cristian@eventos.test')->pluck('id'));
        $this->inscribir($docker, ['oriana@eventos.test', 'alejandro@eventos.test']);

        $inicio = now()->addDays(21)->setTime(17, 0);

        $python = Evento::create([
            'titulo' => 'Curso de Python inicial',
            'descripcion' => 'Cuatro encuentros para aprender lo básico de Python con ejercicios prácticos.',
            'fecha_inicio' => $inicio,
            'fecha_fin' => (clone $inicio)->addHours(3),
            'cupo' => 15,
            'estado' => 'publicado',
            'categoria_id' => Categoria::where('nombre', 'Curso')->value('id'),
            'lugar_id' => Lugar::where('nombre', 'Laboratorio de Informática 1')->value('id'),
            'organizador_id' => $organizador->id,
        ]);
        $python->disertantes()->attach(Disertante::where('email', 'diego@eventos.test')->pluck('id'));

        $revision = [
            'oriana@eventos.test' => ['estado' => 'pendiente'],
            'alejandro@eventos.test' => ['estado' => 'confirmada', 'revisado_por' => $organizador->id, 'revisado_at' => now()->subDay()],
            'franco@eventos.test' => [
                'estado' => 'rechazada',
                'motivo_rechazo' => 'El certificado es del año pasado. Subí uno actualizado.',
                'revisado_por' => $organizador->id,
                'revisado_at' => now()->subDay(),
            ],
        ];

        foreach ($revision as $email => $datos) {
            $usuario = User::where('email', $email)->firstOrFail();
            $archivo = "inscripciones/evento-{$python->id}/certificado-{$usuario->id}.pdf";
            Storage::disk('local')->put($archivo, $this->pdfDeEjemplo($usuario->name));

            Inscripcion::create([
                ...$datos,
                'user_id' => $usuario->id,
                'evento_id' => $python->id,
                'archivo' => $archivo,
            ]);
        }
    }

    private function pdfDeEjemplo(string $nombre): string
    {
        $texto = "BT /F1 18 Tf 72 720 Td (Certificado de alumno regular - {$nombre}) Tj ET";

        $objetos = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            '<< /Length '.strlen($texto)." >>\nstream\n{$texto}\nendstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];

        $pdf = "%PDF-1.4\n";
        $posiciones = [];
        foreach ($objetos as $i => $objeto) {
            $posiciones[] = strlen($pdf);
            $pdf .= ($i + 1)." 0 obj\n{$objeto}\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objetos) + 1)."\n0000000000 65535 f \n";
        foreach ($posiciones as $posicion) {
            $pdf .= sprintf("%010d 00000 n \n", $posicion);
        }

        return $pdf."trailer\n<< /Size ".(count($objetos) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
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
