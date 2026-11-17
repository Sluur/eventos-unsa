<?php

namespace App\Http\Requests;

use Illuminate\Validation\Validator;

class UpdateEventoRequest extends StoreEventoRequest
{
    public function rules(): array
    {
        $reglas = parent::rules();
        $reglas['quitar_imagen'] = ['boolean'];
        $evento = $this->route('evento');

        // Si no se tocó la fecha de inicio, se puede guardar aunque ya haya pasado
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
