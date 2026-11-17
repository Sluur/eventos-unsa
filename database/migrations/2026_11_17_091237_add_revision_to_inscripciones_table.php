<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->enum('estado', ['pendiente', 'confirmada', 'rechazada', 'cancelada'])
                ->default('confirmada')
                ->change();
            $table->string('archivo')->nullable()->after('estado');
            $table->string('motivo_rechazo')->nullable()->after('archivo');
            $table->foreignId('revisado_por')->nullable()->after('motivo_rechazo')
                ->constrained('users')->nullOnDelete();
            $table->dateTime('revisado_at')->nullable()->after('revisado_por');
        });
    }

    public function down(): void
    {
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('revisado_por');
            $table->dropColumn(['archivo', 'motivo_rechazo', 'revisado_at']);
            $table->enum('estado', ['confirmada', 'cancelada'])->default('confirmada')->change();
        });
    }
};
