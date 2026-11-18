<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class InscriptosExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    public function __construct(private Collection $filas)
    {
    }

    public function collection(): Collection
    {
        return $this->filas;
    }

    public function headings(): array
    {
        return ['Nombre', 'Email', 'DNI', 'Estado', 'Fecha de inscripción', 'Asistencia'];
    }
}
