<?php

namespace App\Http\Requests;

use App\Models\Lugar;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
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
            'inscripcion_hasta' => ['nullable', 'date', 'before:fecha_inicio'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'lugar_id' => ['required', 'integer', 'exists:lugares,id'],
            'cupo' => ['required', 'integer', 'min:1'],
            'solo_registrados' => ['boolean'],
            'estado' => ['required', 'in:borrador,publicado'],
            'disertantes' => ['array'],
            'disertantes.*' => ['integer', Rule::exists('disertantes', 'id')->where('activo', true)],
            'imagen' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

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
            'inscripcion_hasta' => 'fecha límite de inscripción',
            'categoria_id' => 'categoría',
            'lugar_id' => 'lugar',
            'cupo' => 'cupo',
            'solo_registrados' => 'solo usuarios registrados',
            'estado' => 'estado',
            'disertantes' => 'disertantes',
            'disertantes.*' => 'disertante',
            'imagen' => 'imagen',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'date' => 'El campo :attribute no es una fecha válida.',
            'fecha_inicio.after' => 'La fecha de inicio tiene que ser futura.',
            'inscripcion_hasta.before' => 'La fecha límite de inscripción tiene que ser anterior al inicio del evento.',
            'integer' => 'El campo :attribute tiene que ser un número entero.',
            'min' => 'El campo :attribute tiene que ser al menos :min.',
            'exists' => 'El :attribute seleccionado no existe.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
            'disertantes.*.exists' => 'El disertante elegido no existe o está inactivo.',
            'categoria_id.required' => 'Elegí una categoría.',
            'in' => 'El :attribute no es válido.',
            'array' => 'El campo :attribute no es válido.',
            'imagen.image' => 'El archivo tiene que ser una imagen.',
            'imagen.mimes' => 'La imagen tiene que ser JPG, PNG o WEBP.',
            'imagen.max' => 'La imagen no puede pesar más de 2 MB.',
            'imagen.uploaded' => 'No se pudo subir la imagen. Probá con una de menos de 2 MB.',
        ];
    }
}
