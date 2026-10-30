<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLugarRequest;
use App\Http\Requests\UpdateLugarRequest;
use App\Models\Lugar;
use Inertia\Inertia;

use Illuminate\Routing\Attributes\Controllers\Middleware;

class LugarController extends Controller
{
    #[Middleware('permission:gestionar lugares')]
    public function index()
    {
        $lugares = Lugar::orderBy('nombre')->get();

        return Inertia::render('Lugares/Index', [
            'lugares' => $lugares,
        ]);
    }

    #[Middleware('permission:gestionar lugares')]
    public function create()
    {
        return Inertia::render('Lugares/Create');
    }

    #[Middleware('permission:gestionar lugares')]
    public function store(StoreLugarRequest $request)
    {
        Lugar::create($request->validated());

        return redirect()
            ->route('lugares.index')
            ->with('success', 'Lugar creado correctamente.');
    }

    #[Middleware('permission:gestionar lugares')]
    public function edit(Lugar $lugar)
    {
        return Inertia::render('Lugares/Edit', [
            'lugar' => $lugar,
        ]);
    }

    #[Middleware('permission:gestionar lugares')]
    public function update(UpdateLugarRequest $request, Lugar $lugar)
    {
        $lugar->update($request->validated());

        return redirect()
            ->route('lugares.index')
            ->with('success', 'Lugar actualizado correctamente.');
    }

    #[Middleware('permission:gestionar lugares')]
    public function destroy(Lugar $lugar)
    {
        if ($lugar->eventos()->exists()) {
            return redirect()
                ->route('lugares.index')
                ->with('error', 'No se puede eliminar: hay eventos en este lugar.');
        }

        $lugar->delete();

        return redirect()
            ->route('lugares.index')
            ->with('success', 'Lugar eliminado correctamente.');
    }
}
