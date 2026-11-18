<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;

class ResumenEventosExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStrictNullComparison
{
    public function __construct(private Collection $filas, private array $totales)
    {
    }

    public function collection(): Collection
    {
        $filas = $this->filas->map(fn ($fila) => [
            $fila['titulo'],
            $fila['categoria'],
            $fila['fecha'],
            $fila['cupo'],
            $fila['inscriptos'],
            $fila['asistentes'],
            $fila['porcentaje'] !== null ? $fila['porcentaje'].'%' : '-',
            $fila['no_show'] !== null ? $fila['no_show'].'%' : '-',
            $fila['puntaje'] ?? '-',
        ]);

        return $filas->push([
            "Total ({$this->totales['eventos']} eventos)",
            '',
            '',
            '',
            $this->totales['inscriptos'],
            $this->totales['asistentes'],
            $this->totales['porcentaje'] !== null ? $this->totales['porcentaje'].'%' : '-',
            $this->totales['no_show'] !== null ? $this->totales['no_show'].'%' : '-',
            $this->totales['puntaje'] ?? '-',
        ]);
    }

    public function headings(): array
    {
        return ['Evento', 'Categoría', 'Fecha', 'Cupo', 'Inscriptos', 'Asistentes', '% asistencia', '% no show', 'Puntaje promedio'];
    }
}
