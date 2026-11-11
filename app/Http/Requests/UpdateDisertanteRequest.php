<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDisertanteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $disertanteId = $this->route('disertante')?->id ?? $this->route('disertante');

        return [
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('disertantes', 'email')->ignore($disertanteId),
            ],
            'biografia' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre' => 'nombre',
            'apellido' => 'apellido',
            'email' => 'email',
            'biografia' => 'biografía',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'unique' => 'Ya existe un disertante con ese :attribute.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'email' => 'El campo :attribute tiene que ser un email válido.',
        ];
    }
}
