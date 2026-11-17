<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Evento;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Parte pública: no hace falta iniciar sesión
class CarteleraController extends Controller
{
    public function index(Request $request)
    {
        $buscar = trim($request->input('buscar', ''));
        $categoria = $request->input('categoria', '');

        $eventos = Evento::with(['categoria:id,nombre,color', 'lugar:id,nombre'])
            ->withCount(['inscripciones as inscriptos_count' => function ($query) {
                $query->activas();
            }])
            ->where('estado', 'publicado')
            ->where('fecha_inicio', '>=', now())
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where('titulo', 'like', "%{$buscar}%");
            })
            ->when($request->filled('categoria'), function ($query) use ($categoria) {
                $query->where('categoria_id', $categoria);
            })
            ->orderBy('fecha_inicio')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Cartelera/Index', [
            'eventos' => $eventos,
            'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre', 'color']),
            'filtros' => [
                'buscar' => $buscar,
                'categoria' => $categoria,
            ],
        ]);
    }

    public function show(Evento $evento)
    {
        abort_unless($evento->estado === 'publicado', 404);

        $evento->load([
            'categoria:id,nombre,color,requiere_aprobacion,requiere_documentacion,documentacion_descripcion',
            'lugar:id,nombre,direccion',
            'disertantes:id,nombre,apellido,biografia',
        ])->loadCount(['inscripciones as inscriptos_count' => function ($query) {
            $query->activas();
        }]);

        return Inertia::render('Cartelera/Show', [
            'evento' => $evento->only([
                'id', 'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'inscripcion_hasta', 'cupo',
                'solo_registrados', 'imagen_url', 'inscriptos_count', 'categoria', 'lugar', 'disertantes',
            ]),
            'motivoSinInscripcion' => $evento->motivoSinInscripcion($evento->inscriptos_count),
            'inscripcionCerrada' => $evento->inscripcionCerrada(),
        ]);
    }

    // Pasa por el login (si hace falta) y vuelve al evento dentro del panel
    public function ingresar(Evento $evento)
    {
        return redirect()->route('eventos.show', $evento);
    }
}
