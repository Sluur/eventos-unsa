<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMensajeEventoRequest;
use App\Mail\MensajeInscriptos;
use App\Models\Evento;
use App\Models\MensajeEvento;
use Illuminate\Routing\Attributes\Controllers\Middleware;

class MensajeEventoController extends Controller
{
    #[Middleware('permission:editar eventos')]
    public function store(StoreMensajeEventoRequest $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        $datos = $request->validated();

        $inscripciones = $evento->inscripciones()
            ->with('user')
            ->when($datos['destinatarios'] === 'confirmados', fn ($query) => $query->where('estado', 'confirmada'))
            ->when($datos['destinatarios'] === 'pendientes', fn ($query) => $query->where('estado', 'pendiente'))
            ->when($datos['destinatarios'] === 'todos', fn ($query) => $query->activas())
            ->get();

        if ($inscripciones->isEmpty()) {
            return back()->with('error', 'No hay inscriptos a quienes mandarles el mensaje.');
        }

        foreach ($inscripciones as $inscripcion) {
            $inscripcion->avisar(new MensajeInscriptos($inscripcion, $datos['asunto'], $datos['cuerpo']));
        }

        MensajeEvento::create([
            ...$datos,
            'evento_id' => $evento->id,
            'user_id' => $request->user()->id,
            'cantidad' => $inscripciones->count(),
        ]);

        $cantidad = $inscripciones->count();

        return back()->with('success', "Mensaje enviado a {$cantidad} ".($cantidad === 1 ? 'inscripto.' : 'inscriptos.'));
    }
}
