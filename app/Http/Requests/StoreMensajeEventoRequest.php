<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMensajeEventoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asunto' => ['required', 'string', 'max:150'],
            'cuerpo' => ['required', 'string', 'max:5000'],
            'destinatarios' => ['required', 'in:confirmados,pendientes,todos'],
        ];
    }

    public function attributes(): array
    {
        return [
            'asunto' => 'asunto',
            'cuerpo' => 'mensaje',
            'destinatarios' => 'destinatarios',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'in' => 'Elegí a quién mandarle el mensaje.',
        ];
    }
}
