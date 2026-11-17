<x-mail::message>
# ¡Hola, {{ $nombre }}!

Recibimos tu inscripción{{ $conDocumentacion ? ' y la documentación que subiste' : '' }}. Queda **pendiente de revisión**: el organizador la tiene que aprobar.

Mientras tanto tu lugar queda reservado. Te vamos a avisar por mail cuando la revisen.

@include('mail.partes.evento')

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
