<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'requiere_aprobacion',
        'requiere_documentacion',
        'documentacion_descripcion',
        'color',
    ];

    protected function casts(): array
    {
        return [
            'requiere_aprobacion' => 'boolean',
            'requiere_documentacion' => 'boolean',
        ];
    }

    public function eventos()
    {
        return $this->hasMany(Evento::class);
    }
}
