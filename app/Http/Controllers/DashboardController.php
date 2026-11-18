<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Inertia\Inertia;

class DashboardController extends Controller
{
    #[Middleware('permission:listar eventos')]
    public function index(Request $request)
    {
        $usuario = $request->user();

        if ($usuario->can('crear eventos')) {
            return Inertia::render('Dashboard/Index', [
                'rol' => 'gestion',
                ...$this->resumenGestion($usuario),
            ]);
        }

        return Inertia::render('Dashboard/Index', [
            'rol' => 'alumno',
            ...$this->resumenAlumno($usuario),
        ]);
    }

    private function resumenGestion($usuario): array
    {
        $esAdmin = $usuario->hasRole('admin');
        $suyos = fn () => Evento::query()->when(!$esAdmin, fn ($q) => $q->where('organizador_id', $usuario->id));

        $proximos = $suyos()
            ->with(['categoria:id,nombre,color', 'lugar:id,nombre'])
            ->withCount([
                'inscripciones as inscriptos_count' => fn ($q) => $q->activas(),
                'inscripciones as pendientes_count' => fn ($q) => $q->where('estado', 'pendiente'),
            ])
            ->where('estado', 'publicado')
            ->where('fecha_fin', '>=', now())
            ->orderBy('fecha_inicio')
            ->get();

        $pendientes = $suyos()
            ->withCount(['inscripciones as pendientes_count' => fn ($q) => $q->where('estado', 'pendiente')])
            ->whereIn('estado', ['publicado', 'finalizado'])
            ->whereHas('inscripciones', fn ($q) => $q->where('estado', 'pendiente'))
            ->orderBy('fecha_inicio')
            ->get(['id', 'titulo', 'fecha_inicio']);

        // los que ya terminaron y todavia no tienen ningun presente cargado
        $sinAsistencia = $suyos()
            ->where('estado', 'finalizado')
            ->whereHas('inscripciones', fn ($q) => $q->where('estado', 'confirmada'))
            ->whereDoesntHave('inscripciones', fn ($q) => $q->where('asistio', true))
            ->orderByDesc('fecha_inicio')
            ->get(['id', 'titulo', 'fecha_inicio']);

        return [
            'tarjetas' => [
                'proximos' => $proximos->count(),
                'pendientes' => $pendientes->sum('pendientes_count'),
                'inscriptos' => $proximos->sum('inscriptos_count'),
                'borradores' => $suyos()->where('estado', 'borrador')->count(),
            ],
            'proximos' => $proximos->take(5)->values(),
            'pendientes' => $pendientes,
            'sinAsistencia' => $sinAsistencia,
            'esAdmin' => $esAdmin,
        ];
    }

    private function resumenAlumno($usuario): array
    {
        $inscripciones = Inscripcion::where('user_id', $usuario->id)
            ->with(['evento.categoria:id,nombre,color', 'evento.lugar:id,nombre'])
            ->withExists('encuesta')
            ->get();

        $proximas = $inscripciones
            ->filter(fn ($i) => $i->estaActiva() && $i->evento->estado === 'publicado' && !$i->evento->yaPaso())
            ->sortBy(fn ($i) => $i->evento->fecha_inicio)
            ->values();

        $certificados = $inscripciones
            ->filter(fn ($i) => $i->estado === 'confirmada' && $i->puedeResponderEncuesta())
            ->sortByDesc(fn ($i) => $i->evento->fecha_inicio)
            ->values();

        return [
            'tarjetas' => [
                'proximas' => $proximas->where('estado', 'confirmada')->count(),
                'pendientes' => $proximas->where('estado', 'pendiente')->count(),
                'certificados' => $certificados->count(),
                'encuestas' => $certificados->where('encuesta_exists', false)->count(),
            ],
            'proximas' => $proximas->take(5)->values(),
            'certificados' => $certificados->take(5)->values(),
        ];
    }
}
