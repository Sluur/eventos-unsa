<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Inscriptos - {{ $evento->titulo }}</title>
    @include('pdf.partes.estilos')
</head>
<body>
    @include('pdf.partes.encabezado', ['titulo' => 'Listado de inscriptos', 'filtros' => $filtros])

    @if ($filas->isEmpty())
        <p class="vacio">No hay inscripciones con este estado.</p>
    @else
        <table class="datos">
            <thead>
                <tr>
                    <th>N°</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>DNI</th>
                    <th>Estado</th>
                    <th>Inscripción</th>
                    <th>Asistencia</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($filas as $fila)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $fila['nombre'] }}</td>
                        <td>{{ $fila['email'] }}</td>
                        <td>{{ $fila['dni'] }}</td>
                        <td>{{ $fila['estado'] }}</td>
                        <td>{{ $fila['fecha'] }}</td>
                        <td>{{ $fila['asistencia'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>
