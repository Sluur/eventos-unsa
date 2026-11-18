<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEncuestaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'puntaje' => ['required', 'integer', 'between:1,5'],
            'comentario' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'puntaje' => 'puntaje',
            'comentario' => 'comentario',
        ];
    }

    public function messages(): array
    {
        return [
            'puntaje.required' => 'Elegí un puntaje de 1 a 5 estrellas.',
            'puntaje.between' => 'Elegí un puntaje de 1 a 5 estrellas.',
            'comentario.max' => 'El comentario puede tener hasta 500 caracteres.',
        ];
    }
}
