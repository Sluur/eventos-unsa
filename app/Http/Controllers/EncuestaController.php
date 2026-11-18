<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEncuestaRequest;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EncuestaController extends Controller
{
    public function create(Request $request, Inscripcion $inscripcion)
    {
        $this->autorizar($request, $inscripcion);

        $inscripcion->load(['evento.categoria:id,nombre,color', 'evento.lugar:id,nombre', 'encuesta']);
        $firmada = $request->hasValidSignature();

        return Inertia::render($request->user() ? 'Encuestas/Responder' : 'Cartelera/Encuesta', [
            'evento' => $inscripcion->evento->only(['id', 'titulo', 'fecha_inicio', 'categoria', 'lugar']),
            'nombre' => $inscripcion->nombreDestino(),
            'respondida' => $inscripcion->encuesta !== null,
            'urlGuardar' => $inscripcion->urlEncuesta($firmada),
        ]);
    }

    public function store(StoreEncuestaRequest $request, Inscripcion $inscripcion)
    {
        $this->autorizar($request, $inscripcion);

        if ($inscripcion->encuesta()->exists()) {
            return back()->with('error', 'Ya respondiste la encuesta de este evento.');
        }

        $inscripcion->encuesta()->create($request->validated());

        return redirect($inscripcion->urlEncuesta($request->hasValidSignature()))
            ->with('success', '¡Gracias por responder la encuesta!');
    }

    private function autorizar(Request $request, Inscripcion $inscripcion): void
    {
        $esDuenio = $request->user() && $inscripcion->user_id === $request->user()->id;

        abort_unless($request->hasValidSignature() || $esDuenio, 403);
        abort_unless(
            $inscripcion->puedeResponderEncuesta(),
            403,
            'La encuesta se habilita cuando termina el evento y tu asistencia está registrada.',
        );
    }
}
