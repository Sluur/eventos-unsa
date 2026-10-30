<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLugarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:150', 'unique:lugares,nombre'],
            'direccion' => ['nullable', 'string', 'max:200'],
            'capacidad' => ['required', 'integer', 'min:1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre' => 'nombre',
            'direccion' => 'dirección',
            'capacidad' => 'capacidad',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'unique' => 'Ya existe un lugar con ese :attribute.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'integer' => 'El campo :attribute tiene que ser un número entero.',
            'min' => 'El campo :attribute tiene que ser al menos :min.',
        ];
    }
}
