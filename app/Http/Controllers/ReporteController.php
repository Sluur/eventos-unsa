<?php

namespace App\Http\Controllers;

use App\Exports\ResumenEventosExport;
use App\Models\Categoria;
use App\Models\Encuesta;
use App\Models\Evento;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReporteController extends Controller
{
    #[Middleware('permission:ver reportes')]
    public function index(Request $request)
    {
        $filtros = $this->filtros($request);
        $filas = $this->filas($filtros, $request->user());

        return Inertia::render('Reportes/Index', [
            'filas' => $filas,
            'totales' => $this->totales($filas),
            'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
            'filtros' => $filtros,
        ]);
    }

    #[Middleware('permission:ver reportes')]
    public function pdf(Request $request)
    {
        $filtros = $this->filtros($request);
        $filas = $this->filas($filtros, $request->user());

        return Pdf::loadView('pdf.resumen', [
            'filas' => $filas,
            'totales' => $this->totales($filas),
            'filtros' => $this->filtrosLegibles($filtros),
        ])->setPaper('a4', 'landscape')->download('resumen-eventos.pdf');
    }

    #[Middleware('permission:ver reportes')]
    public function excel(Request $request)
    {
        $filtros = $this->filtros($request);
        $filas = $this->filas($filtros, $request->user());

        return Excel::download(new ResumenEventosExport($filas, $this->totales($filas)), 'resumen-eventos.xlsx');
    }

    private function filtros(Request $request): array
    {
        $fecha = fn ($valor, $defecto) => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $valor) ? $valor : $defecto;

        $desde = $fecha($request->input('desde'), now()->startOfYear()->format('Y-m-d'));
        $hasta = $fecha($request->input('hasta'), now()->endOfYear()->format('Y-m-d'));

        if ($desde > $hasta) {
            [$desde, $hasta] = [$hasta, $desde];
        }

        return [
            'desde' => $desde,
            'hasta' => $hasta,
            'categoria' => (string) $request->input('categoria'),
        ];
    }

    private function filas(array $filtros, $usuario)
    {
        $puntaje = Encuesta::query()
            ->join('inscripciones', 'inscripciones.id', '=', 'encuestas.inscripcion_id')
            ->whereColumn('inscripciones.evento_id', 'eventos.id')
            ->selectRaw('round(avg(encuestas.puntaje), 1)');

        return Evento::query()
            ->with('categoria:id,nombre')
            ->whereIn('estado', ['publicado', 'finalizado'])
            ->whereBetween('fecha_inicio', [
                Carbon::parse($filtros['desde'])->startOfDay(),
                Carbon::parse($filtros['hasta'])->endOfDay(),
            ])
            ->when($filtros['categoria'] !== '', fn ($q) => $q->where('categoria_id', $filtros['categoria']))
            ->when(!$usuario->hasRole('admin'), fn ($q) => $q->where('organizador_id', $usuario->id))
            ->withCount([
                'inscripciones as inscriptos' => fn ($q) => $q->where('estado', 'confirmada'),
                'inscripciones as asistentes' => fn ($q) => $q->where('estado', 'confirmada')->where('asistio', true),
            ])
            ->addSelect(['puntaje' => $puntaje])
            ->orderBy('fecha_inicio')
            ->get()
            ->map(fn ($evento) => [
                'id' => $evento->id,
                'titulo' => $evento->titulo,
                'categoria' => $evento->categoria->nombre,
                'fecha' => $evento->fecha_inicio->format('d/m/Y'),
                'cupo' => $evento->cupo,
                'inscriptos' => $evento->inscriptos,
                'asistentes' => $evento->asistentes,
                'porcentaje' => $evento->yaPaso() && $evento->inscriptos > 0
                    ? (int) round($evento->asistentes * 100 / $evento->inscriptos)
                    : null,
                'no_show' => $evento->estado === 'finalizado' && $evento->inscriptos > 0
                    ? (int) round(($evento->inscriptos - $evento->asistentes) * 100 / $evento->inscriptos)
                    : null,
                'puntaje' => $evento->puntaje !== null ? (float) $evento->puntaje : null,
            ]);
    }

    private function totales($filas): array
    {
        $pasados = $filas->whereNotNull('porcentaje');
        $inscriptosPasados = $pasados->sum('inscriptos');
        $finalizados = $filas->whereNotNull('no_show');
        $inscriptosFinalizados = $finalizados->sum('inscriptos');

        return [
            'eventos' => $filas->count(),
            'inscriptos' => $filas->sum('inscriptos'),
            'asistentes' => $filas->sum('asistentes'),
            'porcentaje' => $inscriptosPasados > 0 ? (int) round($pasados->sum('asistentes') * 100 / $inscriptosPasados) : null,
            'no_show' => $inscriptosFinalizados > 0
                ? (int) round(($inscriptosFinalizados - $finalizados->sum('asistentes')) * 100 / $inscriptosFinalizados)
                : null,
            'puntaje' => $filas->whereNotNull('puntaje')->isEmpty() ? null : round($filas->whereNotNull('puntaje')->avg('puntaje'), 1),
        ];
    }

    private function filtrosLegibles(array $filtros): array
    {
        return [
            'Desde' => Carbon::parse($filtros['desde'])->format('d/m/Y'),
            'Hasta' => Carbon::parse($filtros['hasta'])->format('d/m/Y'),
            'Categoría' => $filtros['categoria'] !== ''
                ? (Categoria::find($filtros['categoria'])?->nombre ?? 'Todas')
                : 'Todas',
        ];
    }
}
