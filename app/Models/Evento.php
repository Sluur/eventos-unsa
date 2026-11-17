<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Evento extends Model
{
    use HasFactory;

    protected $appends = ['imagen_url'];

    protected $fillable = [
        'imagen',
        'titulo',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'inscripcion_hasta',
        'cupo',
        'solo_registrados',
        'estado',
        'motivo_cancelacion',
        'categoria_id',
        'lugar_id',
        'organizador_id',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'datetime',
            'fecha_fin' => 'datetime',
            'inscripcion_hasta' => 'datetime',
            'solo_registrados' => 'boolean',
        ];
    }

    protected function imagenUrl(): Attribute
    {
        return Attribute::get(fn () => $this->imagen ? Storage::disk('public')->url($this->imagen) : null);
    }

    // Borra el archivo de la imagen del disco, si tiene
    public function borrarImagen(): void
    {
        if ($this->imagen) {
            Storage::disk('public')->delete($this->imagen);
        }
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

    // Lugares tomados: pendientes + confirmadas
    public function lugaresOcupados(): int
    {
        return $this->inscripciones()->activas()->count();
    }

    // Con aprobación la inscripción arranca pendiente
    public function estadoInicialInscripcion(): string
    {
        return $this->categoria->requiere_aprobacion ? 'pendiente' : 'confirmada';
    }

    public function yaPaso(): bool
    {
        return $this->fecha_inicio->isPast();
    }

    // Devuelve por qué no se puede inscribir nadie más, o null si se puede
    public function motivoSinInscripcion(int $ocupados): ?string
    {
        if ($this->estado === 'cancelado') {
            return 'El evento fue cancelado.';
        }

        if ($this->estado === 'finalizado' || $this->yaPaso()) {
            return 'El evento ya pasó.';
        }

        if ($this->estado !== 'publicado') {
            return 'La inscripción no está abierta.';
        }

        if ($this->inscripcionCerrada()) {
            return 'La inscripción cerró el '.$this->inscripcion_hasta->format('d/m \a \l\a\s H:i').'.';
        }

        if ($ocupados >= $this->cupo) {
            return 'No quedan lugares disponibles.';
        }

        return null;
    }

    // Pasó la fecha límite de inscripción
    public function inscripcionCerrada(): bool
    {
        return $this->inscripcion_hasta !== null && $this->inscripcion_hasta->isPast();
    }

    // Finalizados y cancelados ya no se tocan
    public function sePuedeEditar(): bool
    {
        return !in_array($this->estado, ['finalizado', 'cancelado'], true);
    }

    // Solo el organizador del evento o un admin pueden gestionarlo
    public function puedeGestionar(User $usuario): bool
    {
        return $this->organizador_id === $usuario->id || $usuario->hasRole('admin');
    }
}
