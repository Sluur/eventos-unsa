<x-mail::message>
# Hola, {{ $nombre }}

Hubo cambios en un evento al que estás inscripto.

<x-mail::table>
| Qué cambió | Antes | Ahora |
| :--------- | :---- | :---- |
@foreach ($cambios as $cambio)
| {{ $cambio['campo'] }} | {{ $cambio['antes'] }} | **{{ $cambio['ahora'] }}** |
@endforeach
</x-mail::table>

@include('mail.partes.evento')

Tu inscripción sigue vigente.
@unless ($invitado)
Si con los cambios no podés ir, cancelá la inscripción así otra persona puede usar el lugar.
@endunless

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
