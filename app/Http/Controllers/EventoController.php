<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelarEventoRequest;
use App\Http\Requests\StoreEventoRequest;
use App\Http\Requests\UpdateEventoRequest;
use Illuminate\Http\Request;
use App\Models\Categoria;
use App\Models\Disertante;
use App\Models\Evento;
use App\Models\Lugar;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Inertia\Inertia;

class EventoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
#[Middleware('permission:listar eventos')]
public function index(Request $request)
{
    $buscar = trim($request->input('buscar', ''));
    $categoria = $request->input('categoria', '');
    $estado = $request->input('estado', '');
    $orden = $request->input('orden', 'fecha_inicio');
    $direccion = $request->input('direccion', 'asc');
    $porPagina = (int) $request->input('por_pagina', 10);

    // Validamos porque cualquiera puede modificar la URL a mano
    if (!in_array($orden, ['titulo', 'fecha_inicio', 'cupo'], true)) {
        $orden = 'fecha_inicio';
    }
    if (!in_array($direccion, ['asc', 'desc'], true)) {
        $direccion = 'asc';
    }
    if (!in_array($porPagina, [5, 10, 20], true)) {
        $porPagina = 10;
    }

    $eventos = Evento::with(['categoria', 'lugar'])
        ->withCount(['inscripciones as inscriptos_count' => function ($query) {
            $query->where('estado', 'confirmada');
        }])
        // Quien no puede crear eventos (alumno) no ve borradores, y de los cancelados solo en los que estaba inscripto
        ->when(!$request->user()->can('crear eventos'), function ($query) use ($request) {
            $query->where(function ($query) use ($request) {
                $query->whereIn('estado', ['publicado', 'finalizado'])
                    ->orWhere(function ($query) use ($request) {
                        $query->where('estado', 'cancelado')
                            ->whereHas('inscripciones', function ($query) use ($request) {
                                $query->where('user_id', $request->user()->id)->where('estado', 'confirmada');
                            });
                    });
            });
        })
        ->when($buscar !== '', function ($query) use ($buscar) {
            $query->where('titulo', 'like', "%{$buscar}%");
        })
        ->when($request->filled('categoria'), function ($query) use ($categoria) {
            $query->where('categoria_id', $categoria);
        })
        ->when($request->filled('estado'), function ($query) use ($estado) {
            $query->where('estado', $estado);
        })
        ->orderBy($orden, $direccion)
        ->paginate($porPagina)
        ->withQueryString();

    return Inertia::render('Eventos/Index', [
        'eventos' => $eventos,
        'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
        'filtros' => [
            'buscar' => $buscar,
            'categoria' => $categoria,
            'estado' => $estado,
            'orden' => $orden,
            'direccion' => $direccion,
            'por_pagina' => $porPagina,
        ],
    ]);
}

    #[Middleware('permission:crear eventos')]
    public function create(Request $request)
    {
        // Duplicar: se precargan los datos de otro evento, sin fechas
        $original = $request->filled('duplicar')
            ? Evento::with('disertantes:id')->find($request->integer('duplicar'))
            : null;

        return Inertia::render('Eventos/Create', [
            'lugares' => Lugar::orderBy('nombre')->get(['id', 'nombre', 'capacidad']),
            'disertantes' => Disertante::orderBy('apellido')->get(['id', 'nombre', 'apellido']),
            'copia' => $original ? [
                'titulo' => $original->titulo.' (copia)',
                'descripcion' => $original->descripcion,
                'lugar_id' => (string) $original->lugar_id,
                'cupo' => (string) $original->cupo,
                'disertantes' => $original->disertantes->pluck('id'),
                'original' => $original->titulo,
            ] : null,
        ]);
    }

    #[Middleware('permission:crear eventos')]
    public function store(StoreEventoRequest $request)
    {
        $datos = $request->validated();

        // Por ahora solo se cargan charlas
        $charla = Categoria::where('nombre', 'Charla')->firstOrFail();

        $evento = Evento::create([
            'titulo' => $datos['titulo'],
            'descripcion' => $datos['descripcion'],
            'fecha_inicio' => $datos['fecha_inicio'],
            'fecha_fin' => $datos['fecha_fin'],
            'lugar_id' => $datos['lugar_id'],
            'cupo' => $datos['cupo'],
            'estado' => $datos['estado'],
            'categoria_id' => $charla->id,
            'organizador_id' => $request->user()->id,
            'imagen' => $request->hasFile('imagen') ? $request->file('imagen')->store('eventos', 'public') : null,
        ]);

        $evento->disertantes()->sync($datos['disertantes'] ?? []);

        $mensaje = $evento->estado === 'publicado'
            ? 'Charla publicada correctamente.'
            : 'Charla guardada como borrador.';

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
            ->where('estado', 'confirmada')
            ->exists();

        // El alumno no ve borradores, y un cancelado solo si estaba inscripto
        $visible = in_array($evento->estado, ['publicado', 'finalizado'], true)
            || ($evento->estado === 'cancelado' && $miInscripcion);

        if (!$usuario->can('crear eventos') && !$visible) {
            abort(404);
        }

        $evento->load(['categoria', 'lugar', 'organizador:id,name', 'disertantes'])
            ->loadCount(['inscripciones as inscriptos_count' => function ($query) {
                $query->where('estado', 'confirmada');
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
            'puedeInscribirse' => $usuario->can('inscribirse eventos'),
            'estaInscripto' => $miInscripcion,
            'motivoSinInscripcion' => $evento->motivoSinInscripcion($evento->inscriptos_count),
            'yaPaso' => $evento->yaPaso(),
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
                $query->where('estado', 'confirmada');
            }]);

        return Inertia::render('Eventos/Edit', [
            'evento' => $evento,
            'lugares' => Lugar::orderBy('nombre')->get(['id', 'nombre', 'capacidad']),
            'disertantes' => Disertante::orderBy('apellido')->get(['id', 'nombre', 'apellido']),
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

        $evento->update([
            'titulo' => $datos['titulo'],
            'descripcion' => $datos['descripcion'],
            'fecha_inicio' => $datos['fecha_inicio'],
            'fecha_fin' => $datos['fecha_fin'],
            'lugar_id' => $datos['lugar_id'],
            'cupo' => $datos['cupo'],
            'estado' => $datos['estado'],
        ]);

        // Al reemplazar o quitar la imagen se borra el archivo anterior
        if ($request->hasFile('imagen')) {
            $evento->borrarImagen();
            $evento->update(['imagen' => $request->file('imagen')->store('eventos', 'public')]);
        } elseif ($request->boolean('quitar_imagen')) {
            $evento->borrarImagen();
            $evento->update(['imagen' => null]);
        }

        $evento->disertantes()->sync($datos['disertantes'] ?? []);

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

        // Pendiente: acá se manda el mail de aviso a los inscriptos

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', 'El evento fue cancelado.');
    }

    #[Middleware('permission:eliminar eventos')]
    public function destroy(Request $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

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
}
