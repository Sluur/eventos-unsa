<x-mail::message>
# Hola, {{ $nombre }}

El organizador de **{{ $evento->titulo }}** te mandó este mensaje:

{!! nl2br(e($cuerpo)) !!}

@include('mail.partes.evento')

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
