<?php

namespace App\Http\Controllers;

use App\Exports\InscriptosExport;
use App\Models\Evento;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class ReporteInscriptosController extends Controller
{
    private const ESTADOS = [
        'pendiente' => 'Pendientes',
        'confirmada' => 'Confirmadas',
        'rechazada' => 'Rechazadas',
        'cancelada' => 'Canceladas',
    ];

    #[Middleware('permission:ver reportes')]
    public function pdf(Request $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        $estado = $this->estado($request);

        return Pdf::loadView('pdf.inscriptos', [
            'evento' => $evento,
            'filas' => $this->filas($evento, $estado),
            'filtros' => [
                'Evento' => $evento->titulo,
                'Fecha' => $evento->fecha_inicio->format('d/m/Y H:i'),
                'Estado' => $estado ? self::ESTADOS[$estado] : 'Todos',
            ],
        ])->download($this->nombreArchivo($evento, $estado).'.pdf');
    }

    #[Middleware('permission:ver reportes')]
    public function excel(Request $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        $estado = $this->estado($request);

        return Excel::download(
            new InscriptosExport($this->filas($evento, $estado)),
            $this->nombreArchivo($evento, $estado).'.xlsx',
        );
    }

    #[Middleware('permission:ver reportes')]
    public function planilla(Request $request, Evento $evento)
    {
        abort_unless($evento->puedeGestionar($request->user()), 403);

        $evento->load(['categoria', 'lugar', 'organizador']);

        $filas = $evento->inscripciones()
            ->with('user:id,name')
            ->where('estado', 'confirmada')
            ->get()
            ->map(function ($inscripcion) {
                if ($inscripcion->user) {
                    // el nombre viene en un solo campo, tomo la ultima palabra como apellido
                    $partes = explode(' ', trim($inscripcion->user->name));
                    $apellido = array_pop($partes);
                    $nombre = implode(' ', $partes);
                } else {
                    $apellido = $inscripcion->apellido_invitado;
                    $nombre = $inscripcion->nombre_invitado;
                }

                return [
                    'apellido' => $apellido,
                    'nombre' => $nombre ? "{$apellido}, {$nombre}" : $apellido,
                    'dni' => $inscripcion->dni_invitado ?? '',
                ];
            })
            ->sortBy('apellido', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        return Pdf::loadView('pdf.planilla', ['evento' => $evento, 'filas' => $filas])
            ->setPaper('a4', 'portrait')
            ->download('planilla-asistencia-'.Str::slug($evento->titulo).'.pdf');
    }

    private function estado(Request $request): ?string
    {
        $estado = (string) $request->input('estado');

        return array_key_exists($estado, self::ESTADOS) ? $estado : null;
    }

    private function filas(Evento $evento, ?string $estado)
    {
        return $evento->inscripciones()
            ->with('user:id,name,email')
            ->when($estado, fn ($query) => $query->where('estado', $estado))
            ->orderBy('created_at')
            ->get()
            ->map(fn ($inscripcion) => [
                'nombre' => $inscripcion->nombreDestino(),
                'email' => $inscripcion->emailDestino(),
                'dni' => $inscripcion->dni_invitado ?? '-',
                'estado' => ucfirst($inscripcion->estado),
                'fecha' => $inscripcion->created_at->format('d/m/Y H:i'),
                'asistencia' => $inscripcion->asistio ? 'Asistió' : 'No',
            ]);
    }

    private function nombreArchivo(Evento $evento, ?string $estado): string
    {
        return 'inscriptos-'.Str::slug($evento->titulo).($estado ? '-'.Str::slug(self::ESTADOS[$estado]) : '');
    }
}
