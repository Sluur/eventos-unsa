<?php

namespace Database\Seeders;

use App\Models\Disertante;
use Illuminate\Database\Seeder;

class DisertanteSeeder extends Seeder
{
    public function run(): void
    {
        Disertante::factory()->count(12)->create();
    }
}