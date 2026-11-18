<x-mail::message>
# ¡Hola, {{ $nombre }}!

Gracias por participar en **{{ $evento->titulo }}**. Quedó registrada tu asistencia.

Cuando termine el evento, respondé una encuesta corta y descargá tu certificado de asistencia desde este enlace:

<x-mail::button :url="$url">
Ir a la encuesta y al certificado
</x-mail::button>

Guardá este mail: el enlace es personal y es la forma de bajar el certificado sin cuenta.

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
