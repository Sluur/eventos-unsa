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
    Schema::create('disertante_evento', function (Blueprint $table) {
        $table->id();
        $table->foreignId('disertante_id')->constrained('disertantes')->cascadeOnDelete();
        $table->foreignId('evento_id')->constrained('eventos')->cascadeOnDelete();
        $table->timestamps();

        $table->unique(['disertante_id', 'evento_id']);
    });
}

public function down(): void
{
    Schema::dropIfExists('disertante_evento');
}
};
