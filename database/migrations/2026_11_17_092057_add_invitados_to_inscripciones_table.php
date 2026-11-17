<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Un invitado se inscribe sin cuenta: user_id queda null y se guardan sus datos.
    // El unique(user_id, evento_id) sigue sirviendo para los registrados porque admite varios null;
    // que un invitado no repita email o DNI en el mismo evento se valida en la app.
    public function up(): void
    {
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('nombre_invitado', 100)->nullable()->after('user_id');
            $table->string('apellido_invitado', 100)->nullable()->after('nombre_invitado');
            $table->string('email_invitado', 150)->nullable()->after('apellido_invitado');
            $table->string('dni_invitado', 10)->nullable()->after('email_invitado');
        });
    }

    public function down(): void
    {
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->dropColumn(['nombre_invitado', 'apellido_invitado', 'email_invitado', 'dni_invitado']);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
