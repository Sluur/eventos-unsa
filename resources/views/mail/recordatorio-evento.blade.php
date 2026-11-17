<x-mail::message>
# ¡Hola, {{ $nombre }}!

Te recordamos que en menos de 24 horas empieza un evento al que estás inscripto.

@include('mail.partes.evento')

Te recomendamos llegar unos minutos antes. ¡Te esperamos!

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
