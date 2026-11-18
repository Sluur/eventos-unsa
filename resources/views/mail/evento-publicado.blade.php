<x-mail::message>
# ¡Hola, {{ $nombre }}!

Se publicó un evento nuevo que te puede interesar.

@include('mail.partes.evento')

@if ($sigueCategoria && $disertantes->isNotEmpty())
Te avisamos porque seguís la categoría {{ $evento->categoria->nombre }} y a {{ $disertantes->join(', ', ' y ') }}.
@elseif ($sigueCategoria)
Te avisamos porque seguís la categoría {{ $evento->categoria->nombre }}.
@else
Te avisamos porque seguís a {{ $disertantes->join(', ', ' y ') }}.
@endif
Podés dejar de seguir desde el detalle del evento.

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
