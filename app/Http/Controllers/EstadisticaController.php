<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class EstadisticaController extends Controller
{
    #[Middleware('permission:ver dashboard')]
    public function index(Request $request)
    {
        $fecha = fn ($valor, $defecto) => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $valor) ? $valor : $defecto;
        $desde = $fecha($request->input('desde'), now()->startOfYear()->format('Y-m-d'));
        $hasta = $fecha($request->input('hasta'), now()->format('Y-m-d'));

        if ($desde > $hasta) {
            [$desde, $hasta] = [$hasta, $desde];
        }

        // no asistio = inscripcion confirmada en un evento finalizado que no tiene asistencia
        $eventos = Evento::query()
            ->with('categoria:id,nombre,color')
            ->where('estado', 'finalizado')
            ->whereBetween('fecha_inicio', [Carbon::parse($desde)->startOfDay(), Carbon::parse($hasta)->endOfDay()])
            ->withCount([
                'inscripciones as inscriptos' => fn ($q) => $q->where('estado', 'confirmada'),
                'inscripciones as asistentes' => fn ($q) => $q->where('estado', 'confirmada')->where('asistio', true),
            ])
            ->orderBy('fecha_inicio')
            ->get()
            ->map(fn ($evento) => [
                'id' => $evento->id,
                'titulo' => $evento->titulo,
                'fecha' => $evento->fecha_inicio->format('d/m/Y'),
                'categoria' => $evento->categoria,
                'inscriptos' => $evento->inscriptos,
                'asistentes' => $evento->asistentes,
                'no_show' => $evento->inscriptos - $evento->asistentes,
            ]);

        $tasa = fn ($noShow, $inscriptos) => $inscriptos > 0 ? (int) round($noShow * 100 / $inscriptos) : null;

        $porCategoria = $eventos->groupBy(fn ($e) => $e['categoria']->id)
            ->map(function ($grupo) use ($tasa) {
                $inscriptos = $grupo->sum('inscriptos');
                $noShow = $grupo->sum('no_show');

                return [
                    'categoria' => $grupo->first()['categoria']->nombre,
                    'color' => $grupo->first()['categoria']->color,
                    'eventos' => $grupo->count(),
                    'inscriptos' => $inscriptos,
                    'no_show' => $noShow,
                    'tasa' => $tasa($noShow, $inscriptos),
                ];
            })
            ->sortByDesc('tasa')
            ->values();

        $alumnos = Inscripcion::query()
            ->with(['user:id,name,email', 'evento:id,titulo'])
            ->where('estado', 'confirmada')
            ->where('asistio', false)
            ->whereNotNull('user_id')
            ->whereIn('evento_id', $eventos->pluck('id'))
            ->get()
            ->groupBy('user_id')
            ->filter(fn ($faltas) => $faltas->count() >= 2)
            ->map(fn ($faltas) => [
                'id' => $faltas->first()->user->id,
                'nombre' => $faltas->first()->user->name,
                'email' => $faltas->first()->user->email,
                'faltas' => $faltas->count(),
                'eventos' => $faltas->pluck('evento.titulo')->values(),
            ])
            ->sortByDesc('faltas')
            ->values();

        $inscriptos = $eventos->sum('inscriptos');
        $noShow = $eventos->sum('no_show');

        return Inertia::render('Estadisticas/Index', [
            'resumen' => [
                'tasa' => $tasa($noShow, $inscriptos),
                'eventos' => $eventos->count(),
                'inscriptos' => $inscriptos,
                'asistentes' => $eventos->sum('asistentes'),
                'no_show' => $noShow,
            ],
            'porCategoria' => $porCategoria,
            'eventos' => $eventos->where('no_show', '>', 0)
                ->sortByDesc('no_show')
                ->take(5)
                ->map(fn ($e) => [...$e, 'tasa' => $tasa($e['no_show'], $e['inscriptos'])])
                ->values(),
            'alumnos' => $alumnos,
            'filtros' => ['desde' => $desde, 'hasta' => $hasta],
        ]);
    }
}
