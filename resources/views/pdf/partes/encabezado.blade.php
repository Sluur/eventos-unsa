<table class="encabezado">
    <tr>
        <td>
            <div class="sistema">{{ config('app.name') }} · Facultad de Ciencias Exactas, UNSa</div>
            <div class="titulo-reporte">{{ $titulo }}</div>
        </td>
        <td class="generado">Generado el {{ now()->format('d/m/Y H:i') }}</td>
    </tr>
</table>
@if (!empty($filtros))
    <p class="filtros">
        @foreach ($filtros as $nombre => $valor)
            <strong>{{ $nombre }}:</strong> {{ $valor }}@if (!$loop->last) &nbsp;|&nbsp; @endif
        @endforeach
    </p>
@endif
