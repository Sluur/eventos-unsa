<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInscripcionInvitadoRequest;
use App\Mail\InscripcionConfirmada;
use App\Mail\InscripcionRecibida;
use App\Models\Evento;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CarteleraController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()) {
            return redirect()->route('eventos.index');
        }

        $eventos = Evento::with(['categoria:id,nombre,color', 'lugar:id,nombre'])
            ->withCount(['inscripciones as inscriptos_count' => function ($query) {
                $query->activas();
            }])
            ->where('estado', 'publicado')
            ->where('fecha_inicio', '>=', now())
            ->orderBy('fecha_inicio')
            ->limit(6)
            ->get();

        return Inertia::render('Cartelera/Index', [
            'eventos' => $eventos,
            'imagen' => file_exists(public_path('images/facultad.jpg')) ? asset('images/facultad.jpg') : null,
        ]);
    }

    public function show(Request $request, Evento $evento)
    {
        if ($request->user()) {
            return redirect()->route('eventos.show', $evento);
        }

        abort_unless($evento->estado === 'publicado', 404);

        $evento->load([
            'categoria:id,nombre,color,requiere_aprobacion,requiere_documentacion,documentacion_descripcion',
            'lugar:id,nombre,direccion',
            'disertantes:id,nombre,apellido,biografia',
        ])->loadCount(['inscripciones as inscriptos_count' => function ($query) {
            $query->activas();
        }]);

        return Inertia::render('Cartelera/Show', [
            'evento' => $evento->only([
                'id', 'titulo', 'descripcion', 'fecha_inicio', 'inscripcion_hasta', 'cupo',
                'solo_registrados', 'imagen_url', 'inscriptos_count', 'categoria', 'lugar', 'disertantes',
            ]),
            'motivoSinInscripcion' => $evento->motivoSinInscripcion($evento->inscriptos_count),
            'inscripcionCerrada' => $evento->inscripcionCerrada(),
        ]);
    }

    public function inscribir(StoreInscripcionInvitadoRequest $request, Evento $evento)
    {
        $datos = $request->validated();

        $resultado = DB::transaction(function () use ($evento, $datos) {
            $evento = Evento::whereKey($evento->id)->lockForUpdate()->first();

            $previa = Inscripcion::where('evento_id', $evento->id)
                ->whereNull('user_id')
                ->where(function ($query) use ($datos) {
                    $query->where('email_invitado', $datos['email'])->orWhere('dni_invitado', $datos['dni']);
                })
                ->first();

            if ($previa?->estaActiva()) {
                return ['error' => 'Ya hay una inscripción con ese email o DNI en este evento.'];
            }

            $motivo = $evento->motivoSinInscripcion($evento->lugaresOcupados());
            if ($motivo) {
                return ['error' => $motivo];
            }

            $campos = [
                'nombre_invitado' => $datos['nombre'],
                'apellido_invitado' => $datos['apellido'],
                'email_invitado' => $datos['email'],
                'dni_invitado' => $datos['dni'],
                'estado' => $evento->estadoInicialInscripcion(),
                'asistio' => false,
                'motivo_rechazo' => null,
                'revisado_por' => null,
                'revisado_at' => null,
            ];

            if (!empty($datos['archivo'])) {
                if ($previa?->archivo) {
                    Storage::disk('local')->delete($previa->archivo);
                }
                $campos['archivo'] = $datos['archivo']->store("inscripciones/evento-{$evento->id}", 'local');
            }

            $inscripcion = $previa
                ? tap($previa)->update($campos)
                : Inscripcion::create([...$campos, 'evento_id' => $evento->id]);

            return ['inscripcion' => $inscripcion];
        });

        if (isset($resultado['error'])) {
            return back()->with('error', $resultado['error']);
        }

        $inscripcion = $resultado['inscripcion'];

        $inscripcion->avisar($inscripcion->estado === 'pendiente'
            ? new InscripcionRecibida($inscripcion)
            : new InscripcionConfirmada($inscripcion));

        $mensaje = $inscripcion->estado === 'pendiente'
            ? 'Recibimos tu inscripción. Queda pendiente hasta que el organizador la revise.'
            : 'Listo, quedaste inscripto. ¡Te esperamos!';

        return back()->with('success', $mensaje);
    }

    public function ingresar(Evento $evento)
    {
        return redirect()->route('eventos.show', $evento);
    }

    public function registrarse(Request $request, Evento $evento)
    {
        $request->session()->put('url.intended', route('eventos.show', $evento));

        return redirect()->route('register');
    }
}
