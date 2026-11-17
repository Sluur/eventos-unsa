<?php

namespace App\Console\Commands;

use App\Mail\RecordatorioEvento;
use App\Models\Inscripcion;
use Illuminate\Console\Command;

class EnviarRecordatorios extends Command
{
    protected $signature = 'eventos:enviar-recordatorios';

    protected $description = 'Manda un recordatorio a los inscriptos confirmados de los eventos que empiezan en las próximas 24 horas';

    public function handle(): int
    {
        $inscripciones = Inscripcion::with(['evento.lugar', 'user'])
            ->where('estado', 'confirmada')
            ->whereNull('recordatorio_enviado_at')
            ->whereHas('evento', function ($query) {
                $query->where('estado', 'publicado')
                    ->whereBetween('fecha_inicio', [now(), now()->addDay()]);
            })
            ->get();

        foreach ($inscripciones as $inscripcion) {
            $inscripcion->avisar(new RecordatorioEvento($inscripcion));
            $inscripcion->update(['recordatorio_enviado_at' => now()]);
        }

        $this->info("Recordatorios enviados: {$inscripciones->count()}");

        return self::SUCCESS;
    }
}
