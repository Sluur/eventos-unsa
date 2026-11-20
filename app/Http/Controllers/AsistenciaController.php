<?php

namespace App\Http\Controllers;

use App\Http\Requests\GuardarAsistenciaRequest;
use App\Mail\CertificadoDisponible;
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
            ->sortBy(fn ($inscripcion) => $inscripcion->user?->name ?? "{$inscripcion->nombre_invitado} {$inscripcion->apellido_invitado}")
            ->values();

        return Inertia::render('Eventos/Asistencia', [
            'evento' => $evento->only(['id', 'titulo', 'fecha_inicio', 'estado']),
            'inscriptos' => $inscriptos,
        ]);
    }

    #[Middleware('permission:tomar asistencia')]
    public function update(GuardarAsistenciaRequest $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        $presentes = $request->validated()['asistentes'] ?? [];

        $invitadosQueYaEstaban = $evento->inscripciones()
            ->whereNull('user_id')
            ->where('asistio', true)
            ->pluck('id');

        DB::transaction(function () use ($evento, $presentes) {
            $confirmadas = $evento->inscripciones()->where('estado', 'confirmada');

            (clone $confirmadas)->update(['asistio' => false]);
            (clone $confirmadas)->whereIn('id', $presentes)->update(['asistio' => true]);

            if ($evento->estado === 'publicado' && $evento->fecha_inicio->isPast()) {
                $evento->update(['estado' => 'finalizado']);
            }
        });

        // los invitados no tienen cuenta, les llega el enlace al certificado por mail
        $evento->inscripciones()
            ->whereNull('user_id')
            ->where('asistio', true)
            ->whereNotIn('id', $invitadosQueYaEstaban)
            ->get()
            ->each(fn ($inscripcion) => $inscripcion->avisar(new CertificadoDisponible($inscripcion)));

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', 'Asistencia guardada correctamente.');
    }
}
