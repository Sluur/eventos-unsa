<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RechazarInscripcionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'motivo' => ['required', 'string', 'min:5', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'motivo.required' => 'Indicá por qué se rechaza la inscripción.',
            'motivo.min' => 'El motivo tiene que tener al menos :min caracteres.',
            'motivo.max' => 'El motivo no puede superar :max caracteres.',
        ];
    }
}
