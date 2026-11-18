<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CertificadoController extends Controller
{
    public function show(Request $request, Inscripcion $inscripcion)
    {
        $esDuenio = $request->user() && $inscripcion->user_id === $request->user()->id;

        abort_unless($request->hasValidSignature() || $esDuenio, 403);
        abort_unless(
            $inscripcion->puedeResponderEncuesta(),
            403,
            'El certificado está disponible cuando termina el evento y tu asistencia está registrada.',
        );

        if (!$inscripcion->encuesta()->exists()) {
            return redirect($inscripcion->urlEncuesta($request->hasValidSignature()))
                ->with('error', 'Antes de descargar el certificado, respondé la encuesta del evento.');
        }

        $evento = $inscripcion->evento->load(['categoria', 'lugar', 'disertantes', 'organizador']);
        $horas = round($evento->fecha_inicio->diffInMinutes($evento->fecha_fin) / 60, 1);

        $pdf = Pdf::loadView('pdf.certificado', [
            'nombre' => $inscripcion->nombreDestino(),
            'evento' => $evento,
            'horas' => $horas,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('certificado-'.Str::slug($evento->titulo).'.pdf');
    }
}
