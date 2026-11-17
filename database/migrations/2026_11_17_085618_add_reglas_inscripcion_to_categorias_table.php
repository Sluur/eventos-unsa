<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->boolean('requiere_aprobacion')->default(false)->after('descripcion');
            $table->boolean('requiere_documentacion')->default(false)->after('requiere_aprobacion');
            $table->string('documentacion_descripcion')->nullable()->after('requiere_documentacion');
            $table->string('color', 7)->nullable()->after('documentacion_descripcion');
        });
    }

    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropColumn(['requiere_aprobacion', 'requiere_documentacion', 'documentacion_descripcion', 'color']);
        });
    }
};
