<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CategoriaController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::resource('categorias', CategoriaController::class);
});

require __DIR__.'/settings.php';
