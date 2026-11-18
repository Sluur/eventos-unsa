<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\CarteleraController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CertificadoController;
use App\Http\Controllers\DisertanteController;
use App\Http\Controllers\EncuestaController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\LugarController;
use App\Http\Controllers\MensajeEventoController;
use App\Http\Controllers\MisInscripcionesController;
use App\Http\Controllers\RevisionInscripcionController;
use App\Http\Controllers\SeguirController;

Route::get('/', [CarteleraController::class, 'index'])->name('home');
Route::get('cartelera/{evento}', [CarteleraController::class, 'show'])->name('cartelera.show');
Route::post('cartelera/{evento}/inscripcion', [CarteleraController::class, 'inscribir'])->middleware('throttle:5,1')->name('cartelera.inscripcion');
Route::get('cartelera/{evento}/ingresar', [CarteleraController::class, 'ingresar'])->middleware('auth')->name('cartelera.ingresar');
Route::get('cartelera/{evento}/registrarse', [CarteleraController::class, 'registrarse'])->middleware('guest')->name('cartelera.registrarse');

Route::get('inscripciones/{inscripcion}/encuesta', [EncuestaController::class, 'create'])->name('encuestas.create');
Route::post('inscripciones/{inscripcion}/encuesta', [EncuestaController::class, 'store'])->middleware('throttle:10,1')->name('encuestas.store');
Route::get('inscripciones/{inscripcion}/certificado', [CertificadoController::class, 'show'])->name('inscripciones.certificado');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', '/eventos')->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('mis-inscripciones', [MisInscripcionesController::class, 'index'])->name('mis-inscripciones');
    Route::resource('eventos', EventoController::class);
    Route::patch('eventos/{evento}/cancelar', [EventoController::class, 'cancelar'])->name('eventos.cancelar');
    Route::post('eventos/{evento}/inscripcion', [InscripcionController::class, 'store'])->name('eventos.inscripcion.store');
    Route::delete('eventos/{evento}/inscripcion', [InscripcionController::class, 'destroy'])->name('eventos.inscripcion.destroy');
    Route::post('eventos/{evento}/mensajes', [MensajeEventoController::class, 'store'])->name('eventos.mensajes.store');
    Route::get('eventos/{evento}/inscripciones', [RevisionInscripcionController::class, 'index'])->name('eventos.inscripciones');
    Route::patch('inscripciones/{inscripcion}/aceptar', [RevisionInscripcionController::class, 'aceptar'])->name('inscripciones.aceptar');
    Route::patch('inscripciones/{inscripcion}/rechazar', [RevisionInscripcionController::class, 'rechazar'])->name('inscripciones.rechazar');
    Route::get('inscripciones/{inscripcion}/archivo', [InscripcionController::class, 'archivo'])->name('inscripciones.archivo');
    Route::get('eventos/{evento}/asistencia', [AsistenciaController::class, 'edit'])->name('eventos.asistencia.edit');
    Route::put('eventos/{evento}/asistencia', [AsistenciaController::class, 'update'])->name('eventos.asistencia.update');
    Route::post('categorias/{categoria}/seguir', [SeguirController::class, 'seguirCategoria'])->name('categorias.seguir');
    Route::delete('categorias/{categoria}/seguir', [SeguirController::class, 'dejarCategoria'])->name('categorias.dejar');
    Route::post('disertantes/{disertante}/seguir', [SeguirController::class, 'seguirDisertante'])->name('disertantes.seguir');
    Route::delete('disertantes/{disertante}/seguir', [SeguirController::class, 'dejarDisertante'])->name('disertantes.dejar');
    Route::resource('categorias', CategoriaController::class)->except(['show']);
    Route::resource('lugares', LugarController::class)->parameters(['lugares' => 'lugar'])->except(['show']);
    Route::resource('disertantes', DisertanteController::class)->except(['show']);
});

require __DIR__.'/settings.php';
