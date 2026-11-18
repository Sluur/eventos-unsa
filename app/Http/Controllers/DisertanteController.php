<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDisertanteRequest;
use App\Http\Requests\UpdateDisertanteRequest;
use App\Models\Disertante;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Routing\Attributes\Controllers\Middleware;

class DisertanteController extends Controller
{
    #[Middleware('permission:gestionar disertantes')]
    public function index(Request $request)
    {
        $estado = $request->input('estado', 'todos');

        if (!in_array($estado, ['activos', 'inactivos', 'todos'], true)) {
            $estado = 'todos';
        }

        $disertantes = Disertante::withCount(['eventos', 'seguidores'])
            ->when($estado !== 'todos', fn ($query) => $query->where('activo', $estado === 'activos'))
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Disertantes/Index', [
            'disertantes' => $disertantes,
            'estado' => $estado,
        ]);
    }

    #[Middleware('permission:gestionar disertantes')]
    public function create()
    {
        return Inertia::render('Disertantes/Create');
    }

    #[Middleware('permission:gestionar disertantes')]
    public function store(StoreDisertanteRequest $request)
    {
        Disertante::create($request->validated());

        return redirect()
            ->route('disertantes.index')
            ->with('success', 'Disertante creado correctamente.');
    }

    #[Middleware('permission:gestionar disertantes')]
    public function edit(Disertante $disertante)
    {
        return Inertia::render('Disertantes/Edit', [
            'disertante' => $disertante,
        ]);
    }

    #[Middleware('permission:gestionar disertantes')]
    public function update(UpdateDisertanteRequest $request, Disertante $disertante)
    {
        $disertante->update($request->validated());

        return redirect()
            ->route('disertantes.index')
            ->with('success', 'Disertante actualizado correctamente.');
    }

    #[Middleware('permission:gestionar disertantes')]
    public function alternarActivo(Disertante $disertante)
    {
        $disertante->update(['activo' => !$disertante->activo]);

        $mensaje = $disertante->activo
            ? "{$disertante->nombre} {$disertante->apellido} vuelve a estar disponible para nuevos eventos."
            : "{$disertante->nombre} {$disertante->apellido} quedó inactivo. Sigue figurando en los eventos donde ya estaba.";

        return back()->with('success', $mensaje);
    }

    #[Middleware('permission:gestionar disertantes')]
    public function destroy(Disertante $disertante)
    {
        if ($disertante->eventos()->exists()) {
            return redirect()
                ->route('disertantes.index')
                ->with('error', 'No se puede eliminar: el disertante está asignado a eventos. Podés desactivarlo.');
        }

        $disertante->delete();

        return redirect()
            ->route('disertantes.index')
            ->with('success', 'Disertante eliminado correctamente.');
    }
}
