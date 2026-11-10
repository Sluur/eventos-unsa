<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GuardarAsistenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asistentes' => ['array'],
            'asistentes.*' => ['integer', 'exists:inscripciones,id'],
        ];
    }

    public function attributes(): array
    {
        return [
            'asistentes' => 'asistentes',
            'asistentes.*' => 'inscripción',
        ];
    }

    public function messages(): array
    {
        return [
            'array' => 'El listado de :attribute no es válido.',
            'integer' => 'La :attribute no es válida.',
            'exists' => 'La :attribute seleccionada no existe.',
        ];
    }
}
