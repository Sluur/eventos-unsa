<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Certificado de asistencia</title>
    <style>
        @page { margin: 12mm; }
        body { margin: 0; font-family: 'DejaVu Sans', sans-serif; color: #1c2b33; }
        .hoja { border: 3px solid #1f4e5f; padding: 2mm; height: 176mm; }
        .interior { border: 1px solid #1f4e5f; height: 160mm; padding: 12mm 18mm 0; text-align: center; position: relative; }
        .institucion { font-size: 13px; color: #1f4e5f; }
        .institucion strong { font-size: 15px; }
        h1 { margin: 12mm 0 0; font-size: 34px; color: #1f4e5f; }
        .certifica { font-size: 14px; margin-top: 10mm; }
        .nombre { font-size: 30px; font-weight: bold; margin: 4mm 0 6mm; }
        .texto { font-size: 14px; line-height: 1.7; margin: 0 10mm; }
        .titulo { font-weight: bold; }
        .pie { position: absolute; bottom: 26mm; left: 18mm; width: 225mm; }
        .pie td { font-size: 12px; vertical-align: bottom; }
        .firma { border-top: 1px solid #1c2b33; padding-top: 2mm; width: 70mm; margin-left: auto; text-align: center; }
    </style>
</head>
<body>
    @php($fecha = fn ($dia) => $dia->locale('es')->translatedFormat('j \d\e F \d\e Y'))
    <div class="hoja">
        <div class="interior">
            <div class="institucion">
                <strong>Universidad Nacional de Salta</strong><br>
                Facultad de Ciencias Exactas
            </div>

            <h1>Certificado de asistencia</h1>

            <p class="certifica">Se certifica que</p>
            <p class="nombre">{{ $nombre }}</p>

            <p class="texto">
                asistió a <span class="titulo">«{{ $evento->titulo }}»</span> ({{ $evento->categoria->nombre }}),
                @if ($evento->disertantes->isNotEmpty())
                    a cargo de {{ $evento->disertantes->map(fn ($d) => "{$d->nombre} {$d->apellido}")->join(', ', ' y ') }},
                @endif
                que se realizó el {{ $fecha($evento->fecha_inicio) }} en {{ $evento->lugar->nombre }}.
            </p>

            <table class="pie">
                <tr>
                    <td style="text-align: left;">Salta, {{ $fecha(now()) }}</td>
                    <td style="width: 70mm;">
                        <div class="firma">
                            {{ $evento->organizador->name }}<br>
                            Organizador del evento
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
