<?php

namespace Database\Seeders;

use App\Models\Disertante;
use App\Models\Evento;
use Illuminate\Database\Seeder;

class EventoSeeder extends Seeder
{
    public function run(): void
    {
        Evento::factory()->count(20)->create()->each(function (Evento $evento) {
            $disertantes = Disertante::inRandomOrder()
                ->limit(rand(1, 3))
                ->pluck('id');

            $evento->disertantes()->attach($disertantes);
        });
    }
}