<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

class InscripcionController extends Controller
{
    #[Middleware('permission:inscribirse eventos')]
    public function store(Request $request, Evento $evento)
    {
        $usuario = $request->user();

        $error = DB::transaction(function () use ($evento, $usuario) {
            // Bloqueamos el evento para que dos inscripciones simultáneas no pasen el cupo
            $evento = Evento::whereKey($evento->id)->lockForUpdate()->first();

            $inscripcion = Inscripcion::where('evento_id', $evento->id)
                ->where('user_id', $usuario->id)
                ->first();

            if ($inscripcion && $inscripcion->estado === 'confirmada') {
                return 'Ya estás inscripto en este evento.';
            }

            $confirmadas = $evento->inscripciones()->where('estado', 'confirmada')->count();

            $motivo = $evento->motivoSinInscripcion($confirmadas);
            if ($motivo) {
                return $motivo;
            }

            // Si había cancelado antes, reactivamos la misma inscripción
            if ($inscripcion) {
                $inscripcion->update(['estado' => 'confirmada', 'asistio' => false]);
            } else {
                Inscripcion::create([
                    'user_id' => $usuario->id,
                    'evento_id' => $evento->id,
                    'estado' => 'confirmada',
                ]);
            }

            return null;
        });

        if ($error) {
            return redirect()->route('eventos.show', $evento)->with('error', $error);
        }

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', 'Te inscribiste correctamente.');
    }

    #[Middleware('permission:inscribirse eventos')]
    public function destroy(Request $request, Evento $evento)
    {
        $inscripcion = Inscripcion::where('evento_id', $evento->id)
            ->where('user_id', $request->user()->id)
            ->where('estado', 'confirmada')
            ->first();

        if (!$inscripcion) {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'No estás inscripto en este evento.');
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
