<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EventosExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private Collection $eventos)
    {
    }

    public function collection(): Collection
    {
        return $this->eventos;
    }

    public function headings(): array
    {
        return ['Título', 'Categoría', 'Fecha', 'Lugar', 'Estado', 'Cupo', 'Inscriptos'];
    }

    public function map($evento): array
    {
        return [
            $evento->titulo,
            $evento->categoria->nombre,
            $evento->fecha_inicio->format('d/m/Y H:i'),
            $evento->lugar->nombre,
            ucfirst($evento->estado),
            $evento->cupo,
            $evento->inscriptos_count,
        ];
    }
}
