<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelarEventoRequest;
use App\Http\Requests\StoreEventoRequest;
use App\Http\Requests\UpdateEventoRequest;
use Illuminate\Http\Request;
use App\Mail\EventoCancelado;
use App\Mail\EventoModificado;
use App\Models\Categoria;
use App\Models\Disertante;
use App\Models\Evento;
use App\Models\Lugar;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Inertia\Inertia;

class EventoController extends Controller
{
    #[Middleware('permission:listar eventos')]
    public function index(Request $request)
    {
        $usuario = $request->user();
        $buscar = trim($request->input('buscar', ''));
        $categoria = $request->input('categoria', '');
        $vista = $request->input('vista', 'proximos');
        $orden = $request->input('orden', '');
        $direccion = $request->input('direccion', 'asc');
        $porPagina = (int) $request->input('por_pagina', 10);

        $vistas = ['proximos', 'finalizados', 'todos'];
        if ($usuario->can('crear eventos')) {
            $vistas[] = 'borradores';
            $vistas[] = 'cancelados';
        }

        // cualquiera puede tocar la url, por eso valido contra una lista
        if (!in_array($vista, $vistas, true)) {
            $vista = 'proximos';
        }
        if (!in_array($orden, ['titulo', 'fecha_inicio', 'cupo'], true)) {
            $orden = '';
        }
        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'asc';
        }
        if (!in_array($porPagina, [5, 10, 20], true)) {
            $porPagina = 10;
        }

        $base = Evento::query()
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where('titulo', 'like', "%{$buscar}%");
            })
            ->when($request->filled('categoria'), function ($query) use ($categoria) {
                $query->where('categoria_id', $categoria);
            });

        $contadores = [];
        foreach ($vistas as $nombre) {
            $contadores[$nombre] = $this->filtrarVista($base->clone(), $nombre, $usuario)->count();
        }

        // proximo = publicado y todavia no termino, sirve para separar los grupos en "todos"
        $esProximo = "case when estado = 'publicado' and fecha_fin >= ? then 1 else 0 end";

        $eventos = $this->filtrarVista($base->clone(), $vista, $usuario)
            ->select('eventos.*')
            ->selectRaw("{$esProximo} as proximo", [now()])
            ->with(['categoria', 'lugar'])
            ->withCount(['inscripciones as inscriptos_count' => function ($query) {
                $query->activas();
            }])
            ->when($vista === 'todos', function ($query) use ($esProximo) {
                $query->orderByRaw("{$esProximo} desc", [now()]);
            })
            ->when($orden !== '', function ($query) use ($orden, $direccion) {
                $query->orderBy($orden, $direccion);
            }, function ($query) use ($vista) {
                match ($vista) {
                    'finalizados', 'cancelados' => $query->orderByDesc('fecha_inicio'),
                    'todos' => $query
                        ->orderByRaw("case when estado = 'publicado' and fecha_fin >= ? then fecha_inicio end asc", [now()])
                        ->orderByDesc('fecha_inicio'),
                    default => $query->orderBy('fecha_inicio'),
                };
            })
            ->paginate($porPagina)
            ->withQueryString();

        return Inertia::render('Eventos/Index', [
            'eventos' => $eventos,
            'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
            'contadores' => $contadores,
            'filtros' => [
                'buscar' => $buscar,
                'categoria' => $categoria,
                'vista' => $vista,
                'orden' => $orden,
                'direccion' => $direccion,
                'por_pagina' => $porPagina,
            ],
        ]);
    }

    #[Middleware('permission:crear eventos')]
    public function create(Request $request)
    {
        $original = $request->filled('duplicar')
            ? Evento::with('disertantes:id')->find($request->integer('duplicar'))
            : null;

        return Inertia::render('Eventos/Create', [
            'lugares' => Lugar::orderBy('nombre')->get(['id', 'nombre', 'capacidad']),
            'disertantes' => Disertante::orderBy('apellido')->get(['id', 'nombre', 'apellido']),
            'categorias' => $this->categoriasParaFormulario(),
            'copia' => $original ? [
                'titulo' => $original->titulo.' (copia)',
                'categoria_id' => (string) $original->categoria_id,
                'descripcion' => $original->descripcion,
                'lugar_id' => (string) $original->lugar_id,
                'cupo' => (string) $original->cupo,
                'solo_registrados' => $original->solo_registrados,
                'disertantes' => $original->disertantes->pluck('id'),
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
            'fecha_fin' => $datos['fecha_fin'],
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
            ->first(['id', 'estado', 'motivo_rechazo', 'archivo']);

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
            'disertantes' => Disertante::orderBy('apellido')->get(['id', 'nombre', 'apellido']),
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
            'fecha_fin' => $datos['fecha_fin'],
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

    private function filtrarVista($query, string $vista, $usuario)
    {
        $proximos = fn ($q) => $q->where('estado', 'publicado')->where('fecha_fin', '>=', now());
        // los publicados que ya terminaron cuentan como finalizados aunque el comando no haya corrido
        $finalizados = fn ($q) => $q->where('estado', 'finalizado')
            ->orWhere(fn ($q) => $q->where('estado', 'publicado')->where('fecha_fin', '<', now()));

        return match ($vista) {
            'proximos' => $query->where($proximos),
            'finalizados' => $query->where($finalizados),
            'todos' => $query->where(fn ($q) => $q->where($proximos)->orWhere($finalizados)),
            'borradores', 'cancelados' => $query
                ->where('estado', $vista === 'borradores' ? 'borrador' : 'cancelado')
                ->when(!$usuario->hasRole('admin'), fn ($q) => $q->where('organizador_id', $usuario->id)),
        };
    }

    private function datosQueSeAvisan(Evento $evento): array
    {
        return [
            'Inicio' => $evento->fecha_inicio->format('d/m/Y H:i'),
            'Fin' => $evento->fecha_fin->format('d/m/Y H:i'),
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
