<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreCategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (!$this->boolean('requiere_documentacion')) {
            $this->merge(['documentacion_descripcion' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100', 'unique:categorias,nombre'],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'requiere_aprobacion' => ['boolean'],
            'requiere_documentacion' => ['boolean'],
            'documentacion_descripcion' => [
                Rule::requiredIf(fn () => $this->boolean('requiere_documentacion')),
                'nullable',
                'string',
                'max:255',
            ],
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->boolean('requiere_documentacion') && !$this->boolean('requiere_aprobacion')) {
                    $validator->errors()->add(
                        'requiere_aprobacion',
                        'Si pide documentación, la inscripción también tiene que requerir aprobación.'
                    );
                }
            },
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre' => 'nombre',
            'descripcion' => 'descripción',
            'requiere_aprobacion' => 'requiere aprobación',
            'requiere_documentacion' => 'requiere documentación',
            'documentacion_descripcion' => 'documentación a presentar',
            'color' => 'color',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'unique' => 'Ya existe una categoría con ese :attribute.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'boolean' => 'El campo :attribute no es válido.',
            'documentacion_descripcion.required' => 'Indicá qué documentación tiene que presentar el alumno.',
            'color.regex' => 'El color no es válido.',
        ];
    }
}
