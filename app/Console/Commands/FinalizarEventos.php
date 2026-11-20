<?php

namespace App\Console\Commands;

use App\Models\Evento;
use Illuminate\Console\Command;

class FinalizarEventos extends Command
{
    protected $signature = 'eventos:finalizar';

    protected $description = 'Pasa a finalizado los eventos publicados que ya terminaron';

    public function handle(): int
    {
        $cantidad = Evento::where('estado', 'publicado')
            ->where('fecha_inicio', '<', now())
            ->update(['estado' => 'finalizado']);

        $this->info("Eventos finalizados: {$cantidad}");

        return self::SUCCESS;
    }
}
