<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Resumen por evento</title>
    @include('pdf.partes.estilos')
    <style>
        tr.total td { font-weight: bold; border-top: 2px solid #9fb3bc; background: #f2f5f6; }
    </style>
</head>
<body>
    @include('pdf.partes.encabezado', ['titulo' => 'Resumen por evento', 'filtros' => $filtros])

    @if ($filas->isEmpty())
        <p class="vacio">No hay eventos publicados o finalizados en ese período.</p>
    @else
        <table class="datos">
            <thead>
                <tr>
                    <th>Evento</th>
                    <th>Categoría</th>
                    <th>Fecha</th>
                    <th class="num">Cupo</th>
                    <th class="num">Inscriptos</th>
                    <th class="num">Asistentes</th>
                    <th class="num">% asistencia</th>
                    <th class="num">% no show</th>
                    <th class="num">Puntaje</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($filas as $fila)
                    <tr>
                        <td>{{ $fila['titulo'] }}</td>
                        <td>{{ $fila['categoria'] }}</td>
                        <td>{{ $fila['fecha'] }}</td>
                        <td class="num">{{ $fila['cupo'] }}</td>
                        <td class="num">{{ $fila['inscriptos'] }}</td>
                        <td class="num">{{ $fila['asistentes'] }}</td>
                        <td class="num">{{ $fila['porcentaje'] !== null ? $fila['porcentaje'].'%' : '-' }}</td>
                        <td class="num">{{ $fila['no_show'] !== null ? $fila['no_show'].'%' : '-' }}</td>
                        <td class="num">{{ $fila['puntaje'] ?? '-' }}</td>
                    </tr>
                @endforeach
                <tr class="total">
                    <td colspan="4">Total ({{ $totales['eventos'] }} {{ $totales['eventos'] === 1 ? 'evento' : 'eventos' }})</td>
                    <td class="num">{{ $totales['inscriptos'] }}</td>
                    <td class="num">{{ $totales['asistentes'] }}</td>
                    <td class="num">{{ $totales['porcentaje'] !== null ? $totales['porcentaje'].'%' : '-' }}</td>
                    <td class="num">{{ $totales['no_show'] !== null ? $totales['no_show'].'%' : '-' }}</td>
                    <td class="num">{{ $totales['puntaje'] ?? '-' }}</td>
                </tr>
            </tbody>
        </table>
        <p class="filtros" style="margin-top: 8px;">
            El % de asistencia se calcula sobre los inscriptos confirmados y solo para eventos que ya terminaron. El % de no show, solo para eventos finalizados.
        </p>
    @endif
</body>
</html>
