<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Inertia\Inertia;

class MisInscripcionesController extends Controller
{
    #[Middleware('permission:inscribirse eventos')]
    public function index(Request $request)
    {
        $usuario = $request->user();
        $vista = $request->input('vista', 'proximas');

        if (!in_array($vista, ['proximas', 'pendientes', 'pasadas', 'canceladas'], true)) {
            $vista = 'proximas';
        }

        $base = Inscripcion::where('user_id', $usuario->id);

        $filtros = [
            'proximas' => fn ($q) => $q->where('estado', 'confirmada')
                ->whereHas('evento', fn ($e) => $e->where('estado', 'publicado')->where('fecha_fin', '>=', now())),
            'pendientes' => fn ($q) => $q->where('estado', 'pendiente')
                ->whereHas('evento', fn ($e) => $e->where('estado', '!=', 'cancelado')),
            'pasadas' => fn ($q) => $q->where('estado', 'confirmada')
                ->whereHas('evento', fn ($e) => $e->where('estado', 'finalizado')
                    ->orWhere(fn ($e) => $e->where('estado', 'publicado')->where('fecha_fin', '<', now()))),
            'canceladas' => fn ($q) => $q->whereIn('estado', ['cancelada', 'rechazada'])
                ->orWhereHas('evento', fn ($e) => $e->where('estado', 'cancelado')),
        ];

        $contadores = [];
        foreach ($filtros as $nombre => $filtro) {
            $contadores[$nombre] = $base->clone()->where($filtro)->count();
        }

        $inscripciones = $base->clone()
            ->where($filtros[$vista])
            ->with(['evento.categoria:id,nombre,color', 'evento.lugar:id,nombre'])
            ->get()
            ->sortBy(fn ($i) => $i->evento->fecha_inicio, descending: in_array($vista, ['pasadas', 'canceladas'], true))
            ->values();

        return Inertia::render('MisInscripciones/Index', [
            'inscripciones' => $inscripciones,
            'contadores' => $contadores,
            'vista' => $vista,
            'categorias' => $usuario->categoriasSeguidas()->orderBy('nombre')->get(['categorias.id', 'nombre', 'color']),
            'disertantes' => $usuario->disertantesSeguidos()->orderBy('apellido')->get(['disertantes.id', 'nombre', 'apellido']),
        ]);
    }
}
