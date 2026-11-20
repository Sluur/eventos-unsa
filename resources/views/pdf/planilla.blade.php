<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Planilla de asistencia - {{ $evento->titulo }}</title>
    @include('pdf.partes.estilos')
    <style>
        table.datos td { height: 9mm; border-bottom: 1px solid #9fb3bc; }
        .firma { width: 70mm; }
        .datos-evento { width: 100%; margin-bottom: 10px; font-size: 11px; }
        .datos-evento td { padding: 2px 0; }
    </style>
</head>
<body>
    @include('pdf.partes.encabezado', ['titulo' => 'Planilla de asistencia', 'filtros' => []])

    <table class="datos-evento">
        <tr>
            <td><strong>Evento:</strong> {{ $evento->titulo }} ({{ $evento->categoria->nombre }})</td>
            <td><strong>Lugar:</strong> {{ $evento->lugar->nombre }}</td>
        </tr>
        <tr>
            <td>
                <strong>Fecha:</strong> {{ $evento->fecha_inicio->format('d/m/Y') }},
                {{ $evento->fecha_inicio->format('H:i') }} h
            </td>
            <td><strong>Organiza:</strong> {{ $evento->organizador->name }}</td>
        </tr>
    </table>

    @if ($filas->isEmpty())
        <p class="vacio">No hay inscriptos confirmados.</p>
    @else
        <table class="datos">
            <thead>
                <tr>
                    <th style="width: 10mm;">N°</th>
                    <th>Apellido y nombre</th>
                    <th style="width: 28mm;">DNI</th>
                    <th class="firma">Firma</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($filas as $fila)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $fila['nombre'] }}</td>
                        <td>{{ $fila['dni'] }}</td>
                        <td class="firma"></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>
