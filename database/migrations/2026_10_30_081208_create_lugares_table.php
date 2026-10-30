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
    Schema::create('lugares', function (Blueprint $table) {
        $table->id();
        $table->string('nombre', 150);
        $table->string('direccion', 200)->nullable();
        $table->unsignedInteger('capacidad');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('lugares');
}
};
