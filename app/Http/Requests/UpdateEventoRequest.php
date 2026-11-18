<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateEventoRequest extends StoreEventoRequest
{
    public function rules(): array
    {
        $reglas = parent::rules();
        $reglas['quitar_imagen'] = ['boolean'];
        $evento = $this->route('evento');

        // un disertante inactivo que ya estaba en el evento se puede mantener
        $reglas['disertantes.*'] = [
            'integer',
            Rule::exists('disertantes', 'id')->where(fn ($q) => $q->where('activo', true)
                ->orWhereIn('id', $evento->disertantes()->pluck('disertantes.id'))),
        ];

        // si no se toco la fecha se puede guardar aunque ya haya pasado
        if ($this->input('fecha_inicio') === $evento->fecha_inicio->format('Y-m-d\TH:i')) {
            $reglas['fecha_inicio'] = ['required', 'date'];
        }

        return $reglas;
    }

    public function after(): array
    {
        return [
            ...parent::after(),
            function (Validator $validator) {
                $evento = $this->route('evento');
                $ocupados = $evento->lugaresOcupados();

                if (!$validator->errors()->has('cupo') && (int) $this->input('cupo') < $ocupados) {
                    $validator->errors()->add(
                        'cupo',
                        "El cupo no puede ser menor a la cantidad de inscriptos, contando los pendientes ({$ocupados})."
                    );
                }

                if ($this->input('estado') === 'borrador' && $ocupados > 0) {
                    $validator->errors()->add(
                        'estado',
                        'No se puede pasar a borrador un evento que ya tiene inscriptos.'
                    );
                }
            },
        ];
    }
}
