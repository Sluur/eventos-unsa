<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;
use App\Models\Evento;
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

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
