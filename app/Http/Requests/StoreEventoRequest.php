<?php

namespace App\Http\Requests;

use App\Models\Lugar;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreEventoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:200'],
            'descripcion' => ['required', 'string'],
            'fecha_inicio' => ['required', 'date', 'after:now'],
            'fecha_fin' => ['required', 'date', 'after:fecha_inicio'],
            'lugar_id' => ['required', 'integer', 'exists:lugares,id'],
            'cupo' => ['required', 'integer', 'min:1'],
            'estado' => ['required', 'in:borrador,publicado'],
            'disertantes' => ['array'],
            'disertantes.*' => ['integer', 'exists:disertantes,id'],
        ];
    }

    // El cupo no puede ser mayor a lo que entra en el lugar elegido
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->hasAny(['lugar_id', 'cupo'])) {
                    return;
                }

                $lugar = Lugar::find($this->input('lugar_id'));

                if ($lugar && (int) $this->input('cupo') > $lugar->capacidad) {
                    $validator->errors()->add(
                        'cupo',
                        "El cupo no puede superar la capacidad del lugar ({$lugar->capacidad})."
                    );
                }
            },
        ];
    }

    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'descripcion' => 'descripción',
            'fecha_inicio' => 'fecha de inicio',
            'fecha_fin' => 'fecha de fin',
            'lugar_id' => 'lugar',
            'cupo' => 'cupo',
            'estado' => 'estado',
            'disertantes' => 'disertantes',
            'disertantes.*' => 'disertante',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'date' => 'El campo :attribute no es una fecha válida.',
            'fecha_inicio.after' => 'La fecha de inicio tiene que ser futura.',
            'fecha_fin.after' => 'La fecha de fin tiene que ser posterior al inicio.',
            'integer' => 'El campo :attribute tiene que ser un número entero.',
            'min' => 'El campo :attribute tiene que ser al menos :min.',
            'exists' => 'El :attribute seleccionado no existe.',
            'in' => 'El :attribute no es válido.',
            'array' => 'El campo :attribute no es válido.',
        ];
    }
}
