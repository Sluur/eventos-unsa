<x-mail::message>
# Hola, {{ $nombre }}

El organizador revisó tu inscripción y esta vez **no fue aceptada**.

**Motivo:** {{ $motivo }}

Si podés corregirlo, te podés volver a inscribir mientras la inscripción siga abierta.

@include('mail.partes.evento')

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
