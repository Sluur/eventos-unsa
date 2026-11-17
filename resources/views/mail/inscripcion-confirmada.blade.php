<x-mail::message>
# ¡Hola, {{ $nombre }}!

Tu inscripción quedó **confirmada**. Ya tenés tu lugar reservado.

@include('mail.partes.evento')

@unless ($invitado)
Si al final no podés ir, cancelá la inscripción así otra persona puede usar el lugar.
@endunless

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
