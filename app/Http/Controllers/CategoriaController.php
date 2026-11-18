<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoriaRequest;
use App\Http\Requests\UpdateCategoriaRequest;
use App\Models\Categoria;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    #[Middleware('permission:gestionar categorias')]
    public function index()
    {
        $categorias = Categoria::withCount('seguidores')->orderBy('nombre')->get();

        return Inertia::render('Categorias/Index', [
            'categorias' => $categorias,
        ]);
    }

    #[Middleware('permission:gestionar categorias')]
    public function create()
    {
        return Inertia::render('Categorias/Create');
    }

    #[Middleware('permission:gestionar categorias')]
    public function store(StoreCategoriaRequest $request)
    {
        Categoria::create($request->validated());

        return redirect()
            ->route('categorias.index')
            ->with('success', 'Categoría creada correctamente.');
    }

    #[Middleware('permission:gestionar categorias')]
    public function edit(Categoria $categoria)
    {
        return Inertia::render('Categorias/Edit', [
            'categoria' => $categoria,
        ]);
    }

    #[Middleware('permission:gestionar categorias')]
    public function update(UpdateCategoriaRequest $request, Categoria $categoria)
    {
        $categoria->update($request->validated());

        return redirect()
            ->route('categorias.index')
            ->with('success', 'Categoría actualizada correctamente.');
    }

    #[Middleware('permission:gestionar categorias')]
    public function destroy(Categoria $categoria)
    {
        if ($categoria->eventos()->exists()) {
            return redirect()
                ->route('categorias.index')
                ->with('error', 'No se puede eliminar: hay eventos con esta categoría.');
        }

        $categoria->delete();

        return redirect()
            ->route('categorias.index')
            ->with('success', 'Categoría eliminada correctamente.');
    }
}
