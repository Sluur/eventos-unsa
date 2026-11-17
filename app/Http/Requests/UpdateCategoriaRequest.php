<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateCategoriaRequest extends StoreCategoriaRequest
{
    public function rules(): array
    {
        $categoriaId = $this->route('categoria')?->id ?? $this->route('categoria');

        $reglas = parent::rules();
        $reglas['nombre'] = [
            'required',
            'string',
            'max:100',
            Rule::unique('categorias', 'nombre')->ignore($categoriaId),
        ];

        return $reglas;
    }
}
