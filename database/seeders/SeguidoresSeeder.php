<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Disertante;
use App\Models\User;
use Illuminate\Database\Seeder;

class SeguidoresSeeder extends Seeder
{
    public function run(): void
    {
        $oriana = User::where('email', 'oriana@eventos.test')->firstOrFail();
        $alejandro = User::where('email', 'alejandro@eventos.test')->firstOrFail();

        $oriana->categoriasSeguidas()->attach(Categoria::where('nombre', 'Taller')->value('id'));
        $alejandro->disertantesSeguidos()->attach(Disertante::where('email', 'carlos@eventos.test')->value('id'));
    }
}
