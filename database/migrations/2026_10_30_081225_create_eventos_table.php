<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('eventos', function (Blueprint $table) {
        $table->id();
        $table->string('titulo', 200);
        $table->text('descripcion');
        $table->dateTime('fecha_inicio');
        $table->dateTime('fecha_fin');
        $table->unsignedInteger('cupo');
        $table->enum('estado', ['borrador', 'publicado', 'cancelado', 'finalizado'])
              ->default('borrador');
        $table->foreignId('categoria_id')->constrained('categorias')->restrictOnDelete();
        $table->foreignId('lugar_id')->constrained('lugares')->restrictOnDelete();
        $table->foreignId('organizador_id')->constrained('users')->restrictOnDelete();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('eventos');
}
};
