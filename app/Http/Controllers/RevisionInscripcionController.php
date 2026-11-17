<?php

namespace App\Http\Controllers;

use App\Http\Requests\RechazarInscripcionRequest;
use App\Models\Evento;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RevisionInscripcionController extends Controller
{
    #[Middleware('permission:revisar inscripciones')]
    public function index(Request $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        $inscripciones = $evento->inscripciones()
            ->with(['user:id,name,email', 'revisor:id,name'])
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Eventos/Inscripciones', [
            'evento' => $evento->only(['id', 'titulo', 'cupo', 'estado']),
            'inscripciones' => $inscripciones,
            'requiereDocumentacion' => (bool) $evento->categoria->requiere_documentacion,
        ]);
    }

    #[Middleware('permission:revisar inscripciones')]
    public function aceptar(Request $request, Inscripcion $inscripcion)
    {
        abort_unless($inscripcion->evento->puedeGestionar($request->user()), 403);

        $error = DB::transaction(function () use ($inscripcion, $request) {
            $evento = Evento::whereKey($inscripcion->evento_id)->lockForUpdate()->first();
            $inscripcion->refresh();

            if ($inscripcion->estado !== 'pendiente') {
                return 'Esta inscripción ya fue revisada.';
            }

            // Volvemos a mirar el cupo por si cambió mientras estaba pendiente
            $confirmadas = $evento->inscripciones()->where('estado', 'confirmada')->count();
            if ($confirmadas >= $evento->cupo) {
                return 'No quedan lugares para aceptar esta inscripción.';
            }

            $inscripcion->update([
                'estado' => 'confirmada',
                'revisado_por' => $request->user()->id,
                'revisado_at' => now(),
            ]);

            return null;
        });

        if ($error) {
            return back()->with('error', $error);
        }

        // Pendiente: acá se manda el mail de inscripción aceptada

        return back()->with('success', 'Inscripción aceptada.');
    }

    #[Middleware('permission:revisar inscripciones')]
    public function rechazar(RechazarInscripcionRequest $request, Inscripcion $inscripcion)
    {
        abort_unless($inscripcion->evento->puedeGestionar($request->user()), 403);

        if ($inscripcion->estado !== 'pendiente') {
            return back()->with('error', 'Esta inscripción ya fue revisada.');
        }

        $inscripcion->update([
            'estado' => 'rechazada',
            'motivo_rechazo' => $request->validated()['motivo'],
            'revisado_por' => $request->user()->id,
            'revisado_at' => now(),
        ]);

        // Pendiente: acá se manda el mail de inscripción rechazada

        return back()->with('success', 'Inscripción rechazada.');
    }
}
