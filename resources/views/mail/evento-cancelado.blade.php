<x-mail::message>
# Hola, {{ $nombre }}

Lamentamos avisarte que el evento **{{ $evento->titulo }}** fue **cancelado**.

@if ($motivo)
**Motivo:** {{ $motivo }}
@endif

No tenés que hacer nada: tu inscripción queda sin efecto. Si se reprograma, lo vas a ver publicado en la cartelera.

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
