<x-mail::panel>
**{{ $evento->titulo }}**<br>
Fecha: {{ $evento->fecha_inicio->format('d/m/Y') }} a las {{ $evento->fecha_inicio->format('H:i') }} h<br>
Lugar: {{ $evento->lugar->nombre }}@if ($evento->lugar->direccion) ({{ $evento->lugar->direccion }})@endif
</x-mail::panel>

@if ($url)
<x-mail::button :url="$url">
Ver evento
</x-mail::button>
@endif
