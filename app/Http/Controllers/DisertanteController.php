<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDisertanteRequest;
use App\Http\Requests\UpdateDisertanteRequest;
use App\Models\Disertante;
use Inertia\Inertia;

use Illuminate\Routing\Attributes\Controllers\Middleware;

class DisertanteController extends Controller
{
    #[Middleware('permission:gestionar disertantes')]
    public function index()
    {
        $disertantes = Disertante::withCount('eventos')
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Disertantes/Index', [
            'disertantes' => $disertantes,
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
    public function destroy(Disertante $disertante)
    {
        if ($disertante->eventos()->exists()) {
            return redirect()
                ->route('disertantes.index')
                ->with('error', 'No se puede eliminar: el disertante está asignado a eventos.');
        }

        $disertante->delete();

        return redirect()
            ->route('disertantes.index')
            ->with('success', 'Disertante eliminado correctamente.');
    }
}
