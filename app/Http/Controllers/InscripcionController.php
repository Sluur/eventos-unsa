<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInscripcionRequest;
use App\Models\Evento;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InscripcionController extends Controller
{
    #[Middleware('permission:inscribirse eventos')]
    public function store(StoreInscripcionRequest $request, Evento $evento)
    {
        $usuario = $request->user();
        $archivo = $request->validated()['archivo'] ?? null;

        $resultado = DB::transaction(function () use ($evento, $usuario, $archivo) {
            // Bloqueamos el evento para que dos inscripciones simultáneas no pasen el cupo
            $evento = Evento::whereKey($evento->id)->lockForUpdate()->first();

            $inscripcion = Inscripcion::where('evento_id', $evento->id)
                ->where('user_id', $usuario->id)
                ->first();

            if ($inscripcion?->estaActiva()) {
                return ['error' => 'Ya estás inscripto en este evento.'];
            }

            $motivo = $evento->motivoSinInscripcion($evento->lugaresOcupados());
            if ($motivo) {
                return ['error' => $motivo];
            }

            $datos = [
                'estado' => $evento->estadoInicialInscripcion(),
                'asistio' => false,
                'motivo_rechazo' => null,
                'revisado_por' => null,
                'revisado_at' => null,
            ];

            // La documentación queda en el disco privado, en una carpeta por evento
            if ($archivo) {
                if ($inscripcion?->archivo) {
                    Storage::disk('local')->delete($inscripcion->archivo);
                }
                $datos['archivo'] = $archivo->store("inscripciones/evento-{$evento->id}", 'local');
            }

            // Si había cancelado o lo rechazaron, reactivamos la misma inscripción
            if ($inscripcion) {
                $inscripcion->update($datos);
            } else {
                $inscripcion = Inscripcion::create([
                    ...$datos,
                    'user_id' => $usuario->id,
                    'evento_id' => $evento->id,
                ]);
            }

            return ['estado' => $inscripcion->estado];
        });

        if (isset($resultado['error'])) {
            return redirect()->route('eventos.show', $evento)->with('error', $resultado['error']);
        }

        // Pendiente: acá se manda el mail de confirmación o de "inscripción recibida"

        $mensaje = $resultado['estado'] === 'pendiente'
            ? 'Recibimos tu inscripción. Queda pendiente hasta que el organizador la revise.'
            : 'Te inscribiste correctamente.';

        return redirect()->route('eventos.show', $evento)->with('success', $mensaje);
    }

    // Solo el dueño de la inscripción, el organizador del evento o un admin
    public function archivo(Request $request, Inscripcion $inscripcion)
    {
        $usuario = $request->user();

        abort_unless(
            $inscripcion->user_id === $usuario->id || $inscripcion->evento->puedeGestionar($usuario),
            403
        );

        abort_unless($inscripcion->archivo && Storage::disk('local')->exists($inscripcion->archivo), 404);

        $extension = pathinfo($inscripcion->archivo, PATHINFO_EXTENSION);

        return Storage::disk('local')->download($inscripcion->archivo, "documentacion-{$inscripcion->id}.{$extension}");
    }

    #[Middleware('permission:inscribirse eventos')]
    public function destroy(Request $request, Evento $evento)
    {
        $inscripcion = Inscripcion::where('evento_id', $evento->id)
            ->where('user_id', $request->user()->id)
            ->activas()
            ->first();

        if (!$inscripcion) {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'No estás inscripto en este evento.');
        }

        if ($evento->estado === 'cancelado') {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'El evento fue cancelado, no hace falta cancelar la inscripción.');
        }

        if ($evento->yaPaso()) {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'No se puede cancelar la inscripción a un evento que ya pasó.');
        }

        $inscripcion->update(['estado' => 'cancelada']);

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', 'Cancelaste tu inscripción.');
    }
}
