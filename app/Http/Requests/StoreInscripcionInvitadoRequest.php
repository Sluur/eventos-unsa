<?php

namespace App\Http\Requests;

use App\Models\Inscripcion;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Validator;

class StoreInscripcionInvitadoRequest extends StoreInscripcionRequest
{
    // Solo eventos publicados y abiertos al público
    public function authorize(): bool
    {
        $evento = $this->route('evento');

        abort_unless($evento->estado === 'publicado', 404);

        return !$evento->solo_registrados;
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            back()->with('error', 'Este evento es solo para usuarios registrados. Iniciá sesión para inscribirte.')
        );
    }

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'dni' => ['required', 'regex:/^\d{7,8}$/'],
        ];
    }

    // El mismo email o DNI no se puede inscribir dos veces al mismo evento
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $activas = Inscripcion::where('evento_id', $this->route('evento')->id)->activas();

                if (!$validator->errors()->has('email')
                    && (clone $activas)->where('email_invitado', $this->input('email'))->exists()) {
                    $validator->errors()->add('email', 'Ya hay una inscripción con ese email en este evento.');
                }

                if (!$validator->errors()->has('dni')
                    && (clone $activas)->where('dni_invitado', $this->input('dni'))->exists()) {
                    $validator->errors()->add('dni', 'Ya hay una inscripción con ese DNI en este evento.');
                }
            },
        ];
    }

    public function attributes(): array
    {
        return [
            ...parent::attributes(),
            'nombre' => 'nombre',
            'apellido' => 'apellido',
            'email' => 'email',
            'dni' => 'DNI',
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'required' => 'El campo :attribute es obligatorio.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'email.email' => 'El email no es válido.',
            'dni.regex' => 'El DNI tiene que tener 7 u 8 números, sin puntos.',
        ];
    }
}
