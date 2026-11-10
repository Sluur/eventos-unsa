<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\LugarController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::resource('eventos', EventoController::class)->only(['index', 'create', 'store']);
    Route::resource('categorias', CategoriaController::class);
    Route::resource('lugares', LugarController::class)->parameters(['lugares' => 'lugar'])->except(['show']);
});

require __DIR__.'/settings.php';
