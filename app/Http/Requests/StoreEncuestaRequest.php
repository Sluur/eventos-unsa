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
            'comentario' => ['required', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'comentario' => 'comentario',
        ];
    }

    public function messages(): array
    {
        return [
            'comentario.required' => 'Contanos qué te pareció el evento.',
            'comentario.max' => 'El comentario puede tener hasta 500 caracteres.',
        ];
    }
}
