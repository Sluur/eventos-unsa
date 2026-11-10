<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventoRequest;
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
        // Quien no puede crear eventos (alumno) no ve borradores ni cancelados
        ->when(!$request->user()->can('crear eventos'), function ($query) {
            $query->whereIn('estado', ['publicado', 'finalizado']);
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
    public function create()
    {
        return Inertia::render('Eventos/Create', [
            'lugares' => Lugar::orderBy('nombre')->get(['id', 'nombre', 'capacidad']),
            'disertantes' => Disertante::orderBy('apellido')->get(['id', 'nombre', 'apellido']),
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

        // El alumno no puede ver borradores ni cancelados
        if (!$usuario->can('crear eventos') && !in_array($evento->estado, ['publicado', 'finalizado'], true)) {
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

        $miInscripcion = $evento->inscripciones()
            ->where('user_id', $usuario->id)
            ->where('estado', 'confirmada')
            ->exists();

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

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
