<?php

namespace App\Http\Controllers;

use App\Http\Requests\GuardarAsistenciaRequest;
use App\Models\Evento;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AsistenciaController extends Controller
{
    #[Middleware('permission:tomar asistencia')]
    public function edit(Request $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        $inscriptos = $evento->inscripciones()
            ->with('user:id,name,email')
            ->where('estado', 'confirmada')
            ->get()
            ->sortBy('user.name')
            ->values();

        return Inertia::render('Eventos/Asistencia', [
            'evento' => $evento->only(['id', 'titulo', 'fecha_inicio', 'fecha_fin', 'estado']),
            'inscriptos' => $inscriptos,
        ]);
    }

    #[Middleware('permission:tomar asistencia')]
    public function update(GuardarAsistenciaRequest $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        $presentes = $request->validated()['asistentes'] ?? [];

        DB::transaction(function () use ($evento, $presentes) {
            $confirmadas = $evento->inscripciones()->where('estado', 'confirmada');

            (clone $confirmadas)->update(['asistio' => false]);
            (clone $confirmadas)->whereIn('id', $presentes)->update(['asistio' => true]);

            // Si el evento ya terminó, al tomar asistencia queda finalizado
            if ($evento->estado === 'publicado' && $evento->fecha_fin->isPast()) {
                $evento->update(['estado' => 'finalizado']);
            }
        });

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', 'Asistencia guardada correctamente.');
    }
}
