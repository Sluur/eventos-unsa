<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';

    // Pendientes y confirmadas reservan lugar en el cupo
    public const ACTIVAS = ['pendiente', 'confirmada'];

    protected $fillable = [
        'user_id',
        'evento_id',
        'estado',
        'asistio',
        'archivo',
        'motivo_rechazo',
        'revisado_por',
        'revisado_at',
    ];

    protected function casts(): array
    {
        return [
            'asistio' => 'boolean',
            'revisado_at' => 'datetime',
        ];
    }

    public function scopeActivas(Builder $query): void
    {
        $query->whereIn('estado', self::ACTIVAS);
    }

    public function estaActiva(): bool
    {
        return in_array($this->estado, self::ACTIVAS, true);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function evento()
    {
        return $this->belongsTo(Evento::class);
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'revisado_por');
    }
}
