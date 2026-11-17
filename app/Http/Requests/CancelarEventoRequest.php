<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelarEventoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'motivo' => ['required', 'string', 'min:10', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'motivo' => 'motivo',
        ];
    }

    public function messages(): array
    {
        return [
            'motivo.required' => 'Contá brevemente por qué se cancela el evento.',
            'motivo.min' => 'El motivo tiene que tener al menos :min caracteres.',
            'motivo.max' => 'El motivo no puede superar :max caracteres.',
        ];
    }
}
