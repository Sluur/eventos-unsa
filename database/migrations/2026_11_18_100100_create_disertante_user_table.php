<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disertante_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disertante_id')->constrained('disertantes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['disertante_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disertante_user');
    }
};
