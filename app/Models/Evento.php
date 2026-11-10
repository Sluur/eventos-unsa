<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evento extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'cupo',
        'estado',
        'categoria_id',
        'lugar_id',
        'organizador_id',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'datetime',
            'fecha_fin' => 'datetime',
        ];
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function lugar()
    {
        return $this->belongsTo(Lugar::class);
    }

    public function organizador()
    {
        return $this->belongsTo(User::class, 'organizador_id');
    }

    public function disertantes()
    {
        return $this->belongsToMany(Disertante::class, 'disertante_evento')
            ->withTimestamps();
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    // Solo el organizador del evento o un admin pueden gestionarlo
    public function puedeGestionar(User $usuario): bool
    {
        return $this->organizador_id === $usuario->id || $usuario->hasRole('admin');
    }
}
