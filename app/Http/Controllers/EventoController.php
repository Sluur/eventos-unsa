<?php

namespace App\Http\Controllers;

use App\Exports\EventosExport;
use App\Http\Requests\CancelarEventoRequest;
use App\Http\Requests\StoreEventoRequest;
use App\Http\Requests\UpdateEventoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Mail\EventoCancelado;
use App\Mail\EventoModificado;
use App\Models\Categoria;
use App\Models\Disertante;
use App\Models\Encuesta;
use App\Models\Evento;
use App\Models\Lugar;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class EventoController extends Controller
{
    #[Middleware('permission:listar eventos')]
    public function index(Request $request)
    {
        $usuario = $request->user();
        $filtros = $this->filtrosListado($request);
        $porPagina = (int) $request->input('por_pagina', 10);
        $mes = (string) $request->input('mes');

        if (!in_array($porPagina, [5, 10, 20], true)) {
            $porPagina = 10;
        }

        $contadores = [];
        foreach ($this->vistasPermitidas($usuario) as $vista) {
            $contadores[$vista] = Evento::filtrar($filtros)->enVista($vista, $usuario)->count();
        }

        $eventos = $this->listado($filtros, $usuario)
            ->paginate($porPagina)
            ->withQueryString();

        $calendario = null;
        if ($request->input('modo') === 'calendario') {
            $inicioMes = preg_match('/^\d{4}-\d{2}$/', $mes)
                ? Carbon::createFromFormat('Y-m-d', "{$mes}-01")->startOfDay()
                : now()->startOfMonth();

            $calendario = [
                'mes' => $inicioMes->format('Y-m'),
                'eventos' => Evento::filtrar($filtros)
                    ->enVista($filtros['vista'], $usuario)
                    ->conProximo()
                    ->with('categoria:id,nombre,color')
                    ->whereBetween('fecha_inicio', [$inicioMes, $inicioMes->copy()->endOfMonth()])
                    ->orderBy('fecha_inicio')
                    ->get(),
            ];
        }

        return Inertia::render('Eventos/Index', [
            'eventos' => $eventos,
            'calendario' => $calendario,
            'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
            'contadores' => $contadores,
            'filtros' => [...$filtros, 'por_pagina' => $porPagina],
        ]);
    }

    #[Middleware('permission:ver reportes')]
    public function exportar(Request $request)
    {
        $eventos = $this->listado($this->filtrosListado($request), $request->user())->get();

        return Excel::download(new EventosExport($eventos), 'eventos-'.now()->format('Y-m-d').'.xlsx');
    }

    #[Middleware('permission:crear eventos')]
    public function create(Request $request)
    {
        $original = $request->filled('duplicar')
            ? Evento::with('disertantes:id,activo')->find($request->integer('duplicar'))
            : null;

        return Inertia::render('Eventos/Create', [
            'lugares' => Lugar::orderBy('nombre')->get(['id', 'nombre', 'capacidad']),
            'disertantes' => Disertante::where('activo', true)->orderBy('apellido')->get(['id', 'nombre', 'apellido']),
            'categorias' => $this->categoriasParaFormulario(),
            'copia' => $original ? [
                'titulo' => $original->titulo.' (copia)',
                'categoria_id' => (string) $original->categoria_id,
                'descripcion' => $original->descripcion,
                'lugar_id' => (string) $original->lugar_id,
                'cupo' => (string) $original->cupo,
                'solo_registrados' => $original->solo_registrados,
                'disertantes' => $original->disertantes->where('activo', true)->pluck('id')->values(),
                'original' => $original->titulo,
            ] : null,
        ]);
    }

    #[Middleware('permission:crear eventos')]
    public function store(StoreEventoRequest $request)
    {
        $datos = $request->validated();

        $evento = Evento::create([
            'titulo' => $datos['titulo'],
            'descripcion' => $datos['descripcion'],
            'fecha_inicio' => $datos['fecha_inicio'],
            'inscripcion_hasta' => $datos['inscripcion_hasta'] ?? null,
            'lugar_id' => $datos['lugar_id'],
            'cupo' => $datos['cupo'],
            'solo_registrados' => $datos['solo_registrados'] ?? true,
            'estado' => $datos['estado'],
            'categoria_id' => $datos['categoria_id'],
            'organizador_id' => $request->user()->id,
            'imagen' => $request->hasFile('imagen') ? $request->file('imagen')->store('eventos', 'public') : null,
        ]);

        $evento->disertantes()->sync($datos['disertantes'] ?? []);

        if ($evento->estado === 'publicado') {
            $evento->avisarSeguidores();
        }

        $mensaje = $evento->estado === 'publicado'
            ? 'Evento publicado correctamente.'
            : 'Evento guardado como borrador.';

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', $mensaje);
    }

    #[Middleware('permission:listar eventos')]
    public function show(Request $request, Evento $evento)
    {
        $usuario = $request->user();

        $miInscripcion = $evento->inscripciones()
            ->where('user_id', $usuario->id)
            ->withExists('encuesta')
            ->first(['id', 'estado', 'motivo_rechazo', 'archivo', 'asistio']);

        $estaInscripto = $miInscripcion?->estaActiva() ?? false;

        $visible = in_array($evento->estado, ['publicado', 'finalizado'], true)
            || ($evento->estado === 'cancelado' && $estaInscripto);

        if (!$usuario->can('crear eventos') && !$visible) {
            abort(404);
        }

        $evento->load(['categoria', 'lugar', 'organizador:id,name', 'disertantes'])
            ->loadCount(['inscripciones as inscriptos_count' => function ($query) {
                $query->activas();
            }]);

        $puedeGestionar = $evento->puedeGestionar($usuario);

        $inscriptos = $puedeGestionar
            ? $evento->inscripciones()
                ->with('user:id,name,email')
                ->where('estado', 'confirmada')
                ->orderBy('created_at')
                ->get()
            : [];

        return Inertia::render('Eventos/Show', [
            'evento' => $evento,
            'puedeGestionar' => $puedeGestionar,
            'inscriptos' => $inscriptos,
            'pendientes' => $puedeGestionar ? $evento->inscripciones()->where('estado', 'pendiente')->count() : 0,
            'mensajes' => $puedeGestionar
                ? $evento->mensajes()->with('autor:id,name')->latest()->get()
                : [],
            'puedeInscribirse' => $usuario->can('inscribirse eventos'),
            'estaInscripto' => $estaInscripto,
            'miInscripcion' => $miInscripcion,
            'motivoSinInscripcion' => $evento->motivoSinInscripcion($evento->inscriptos_count),
            'yaPaso' => $evento->yaPaso(),
            'inscripcionCerrada' => $evento->inscripcionCerrada(),
            'encuesta' => $puedeGestionar ? $this->resultadosEncuesta($evento) : null,
            'asistencia' => $puedeGestionar && $evento->estado === 'finalizado' ? $this->asistencia($evento) : null,
            'sigueCategoria' => $usuario->categoriasSeguidas()->whereKey($evento->categoria_id)->exists(),
            'disertantesSeguidos' => $usuario->disertantesSeguidos()
                ->whereIn('disertantes.id', $evento->disertantes->pluck('id'))
                ->pluck('disertantes.id'),
        ]);
    }

    #[Middleware('permission:editar eventos')]
    public function edit(Request $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        if (!$evento->sePuedeEditar()) {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'No se puede editar un evento finalizado o cancelado.');
        }

        $evento->load('disertantes:id')
            ->loadCount(['inscripciones as inscriptos_count' => function ($query) {
                $query->activas();
            }]);

        return Inertia::render('Eventos/Edit', [
            'evento' => $evento,
            'lugares' => Lugar::orderBy('nombre')->get(['id', 'nombre', 'capacidad']),
            'disertantes' => Disertante::where('activo', true)
                ->orWhereIn('id', $evento->disertantes->pluck('id'))
                ->orderBy('apellido')
                ->get(['id', 'nombre', 'apellido']),
            'categorias' => $this->categoriasParaFormulario(),
        ]);
    }

    #[Middleware('permission:editar eventos')]
    public function update(UpdateEventoRequest $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        if (!$evento->sePuedeEditar()) {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'No se puede editar un evento finalizado o cancelado.');
        }

        $datos = $request->validated();
        $antes = $this->datosQueSeAvisan($evento);
        $estabaPublicado = $evento->estado === 'publicado';

        $evento->update([
            'titulo' => $datos['titulo'],
            'descripcion' => $datos['descripcion'],
            'fecha_inicio' => $datos['fecha_inicio'],
            'inscripcion_hasta' => $datos['inscripcion_hasta'] ?? null,
            'categoria_id' => $datos['categoria_id'],
            'lugar_id' => $datos['lugar_id'],
            'cupo' => $datos['cupo'],
            'solo_registrados' => $datos['solo_registrados'] ?? true,
            'estado' => $datos['estado'],
        ]);

        if ($request->hasFile('imagen')) {
            $evento->borrarImagen();
            $evento->update(['imagen' => $request->file('imagen')->store('eventos', 'public')]);
        } elseif ($request->boolean('quitar_imagen')) {
            $evento->borrarImagen();
            $evento->update(['imagen' => null]);
        }

        $evento->disertantes()->sync($datos['disertantes'] ?? []);

        if (!$estabaPublicado && $evento->estado === 'publicado') {
            $evento->avisarSeguidores();
        }

        $ahora = $this->datosQueSeAvisan($evento->refresh());
        $cambios = [];
        foreach ($antes as $campo => $valor) {
            if ($valor !== $ahora[$campo]) {
                $cambios[] = ['campo' => $campo, 'antes' => $valor, 'ahora' => $ahora[$campo]];
            }
        }

        if ($cambios) {
            $this->avisarInscriptos($evento, fn ($inscripcion) => new EventoModificado($inscripcion, $cambios));
        }

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', 'Evento actualizado correctamente.');
    }

    #[Middleware('permission:editar eventos')]
    public function cancelar(CancelarEventoRequest $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        if (!$evento->sePuedeEditar()) {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'El evento ya está finalizado o cancelado.');
        }

        $evento->update([
            'estado' => 'cancelado',
            'motivo_cancelacion' => $request->validated()['motivo'],
        ]);

        $this->avisarInscriptos($evento, fn ($inscripcion) => new EventoCancelado($inscripcion));

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', 'El evento fue cancelado.');
    }

    #[Middleware('permission:eliminar eventos')]
    public function destroy(Request $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        if ($evento->estado === 'finalizado') {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'No se puede eliminar un evento finalizado.');
        }

        if ($evento->inscripciones()->exists()) {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'No se puede eliminar porque tiene inscripciones. Si no se va a hacer, cancelalo.');
        }

        $evento->borrarImagen();
        $evento->delete();

        return redirect()
            ->route('eventos.index')
            ->with('success', 'Evento eliminado correctamente.');
    }

    private function vistasPermitidas($usuario): array
    {
        return $usuario->can('crear eventos')
            ? ['proximos', 'finalizados', 'todos', 'borradores', 'cancelados']
            : ['proximos', 'finalizados', 'todos'];
    }

    private function filtrosListado(Request $request): array
    {
        $vista = (string) $request->input('vista', 'proximos');
        $orden = (string) $request->input('orden');
        $direccion = (string) $request->input('direccion', 'asc');

        // cualquiera puede tocar la url, por eso valido contra una lista
        return [
            'buscar' => trim((string) $request->input('buscar')),
            'categoria' => (string) $request->input('categoria'),
            'vista' => in_array($vista, $this->vistasPermitidas($request->user()), true) ? $vista : 'proximos',
            'orden' => in_array($orden, ['titulo', 'fecha_inicio', 'cupo'], true) ? $orden : '',
            'direccion' => in_array($direccion, ['asc', 'desc'], true) ? $direccion : 'asc',
        ];
    }

    private function listado(array $filtros, $usuario)
    {
        return Evento::filtrar($filtros)
            ->enVista($filtros['vista'], $usuario)
            ->conProximo()
            ->with(['categoria', 'lugar'])
            ->withCount(['inscripciones as inscriptos_count' => function ($query) {
                $query->activas();
            }])
            ->ordenListado($filtros);
    }

    private function asistencia(Evento $evento): array
    {
        $confirmados = $evento->inscripciones()->where('estado', 'confirmada')->count();
        $asistentes = $evento->inscripciones()->where('estado', 'confirmada')->where('asistio', true)->count();

        return [
            'confirmados' => $confirmados,
            'asistentes' => $asistentes,
            'no_show' => $confirmados - $asistentes,
            'porcentaje' => $confirmados > 0 ? (int) round(($confirmados - $asistentes) * 100 / $confirmados) : null,
        ];
    }

    private function resultadosEncuesta(Evento $evento): array
    {
        $respuestas = Encuesta::whereHas('inscripcion', fn ($q) => $q->where('evento_id', $evento->id))
            ->latest()
            ->get(['comentario', 'created_at']);

        return [
            'cantidad' => $respuestas->count(),
            'asistentes' => $evento->inscripciones()->where('asistio', true)->count(),
            'comentarios' => $respuestas->whereNotNull('comentario')->values(),
        ];
    }

    private function datosQueSeAvisan(Evento $evento): array
    {
        return [
            'Inicio' => $evento->fecha_inicio->format('d/m/Y H:i'),
            'Lugar' => $evento->lugar()->value('nombre'),
        ];
    }

    private function avisarInscriptos(Evento $evento, callable $crearMail): void
    {
        $evento->inscripciones()->activas()->with('user')->get()
            ->each(fn ($inscripcion) => $inscripcion->avisar($crearMail($inscripcion)));
    }

    private function categoriasParaFormulario()
    {
        return Categoria::orderBy('nombre')->get([
            'id', 'nombre', 'color', 'requiere_aprobacion', 'requiere_documentacion', 'documentacion_descripcion',
        ]);
    }
}
