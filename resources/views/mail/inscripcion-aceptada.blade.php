<x-mail::message>
# ¡Hola, {{ $nombre }}!

¡Buenas noticias! El organizador **aceptó** tu inscripción. Ya tenés tu lugar confirmado.

@include('mail.partes.evento')

@unless ($invitado)
Si al final no podés ir, cancelá la inscripción así otra persona puede usar el lugar.
@endunless

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
