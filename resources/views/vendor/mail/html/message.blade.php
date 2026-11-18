<x-mail::layout>
{{-- Header --}}
<x-slot:header>
<x-mail::header :url="config('app.url')">
@if (config('app.logo'))
<img src="{{ asset(config('app.logo')) }}" alt="Exactas · UNSa" style="height: 48px;">
@else
Exactas · UNSa
@endif
</x-mail::header>
</x-slot:header>

{{-- Body --}}
{!! $slot !!}

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{!! $subcopy !!}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
<x-mail::footer>
{{ config('app.name') }} · Universidad Nacional de Salta. Recibís este mail por tu inscripción a un evento.
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>
