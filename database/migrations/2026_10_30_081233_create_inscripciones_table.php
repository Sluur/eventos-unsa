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
    Schema::create('inscripciones', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
        $table->foreignId('evento_id')->constrained('eventos')->cascadeOnDelete();
        $table->enum('estado', ['confirmada', 'cancelada'])->default('confirmada');
        $table->boolean('asistio')->default(false);
        $table->timestamps();

        $table->unique(['user_id', 'evento_id']);
    });
}

public function down(): void
{
    Schema::dropIfExists('inscripciones');
}
};
