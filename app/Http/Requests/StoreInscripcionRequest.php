<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInscripcionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $evento = $this->route('evento');

        return [
            'archivo' => [
                Rule::requiredIf(fn () => (bool) $evento->categoria?->requiere_documentacion),
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'archivo' => 'archivo',
        ];
    }

    public function messages(): array
    {
        $documentacion = $this->route('evento')->categoria?->documentacion_descripcion ?? 'la documentación';

        return [
            'archivo.required' => "Tenés que subir: {$documentacion}.",
            'archivo.mimes' => 'El archivo tiene que ser PDF, JPG o PNG.',
            'archivo.max' => 'El archivo no puede pesar más de 5 MB.',
            'archivo.uploaded' => 'No se pudo subir el archivo. Probá con uno de menos de 5 MB.',
        ];
    }
}
