<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Disertante;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;

class SeguirController extends Controller
{
    #[Middleware('permission:listar eventos')]
    public function seguirCategoria(Request $request, Categoria $categoria)
    {
        $request->user()->categoriasSeguidas()->syncWithoutDetaching([$categoria->id]);

        return back()->with('success', "Ahora seguís la categoría {$categoria->nombre}. Te avisamos cuando se publique un evento nuevo.");
    }

    #[Middleware('permission:listar eventos')]
    public function dejarCategoria(Request $request, Categoria $categoria)
    {
        $request->user()->categoriasSeguidas()->detach($categoria->id);

        return back()->with('success', "Dejaste de seguir la categoría {$categoria->nombre}.");
    }

    #[Middleware('permission:listar eventos')]
    public function seguirDisertante(Request $request, Disertante $disertante)
    {
        $request->user()->disertantesSeguidos()->syncWithoutDetaching([$disertante->id]);

        return back()->with('success', "Ahora seguís a {$disertante->nombre} {$disertante->apellido}. Te avisamos cuando dé un evento nuevo.");
    }

    #[Middleware('permission:listar eventos')]
    public function dejarDisertante(Request $request, Disertante $disertante)
    {
        $request->user()->disertantesSeguidos()->detach($disertante->id);

        return back()->with('success', "Dejaste de seguir a {$disertante->nombre} {$disertante->apellido}.");
    }
}
