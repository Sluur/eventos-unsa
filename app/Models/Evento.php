<?php

namespace App\Models;

use App\Mail\EventoPublicado;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
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

    public function mensajes()
    {
        return $this->hasMany(MensajeEvento::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    public function lugaresOcupados(): int
    {
        return $this->inscripciones()->activas()->count();
    }

    public function estadoInicialInscripcion(): string
    {
        return $this->categoria->requiere_aprobacion ? 'pendiente' : 'confirmada';
    }

    public function yaPaso(): bool
    {
        return $this->fecha_inicio->isPast();
    }

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

    public function inscripcionCerrada(): bool
    {
        return $this->inscripcion_hasta !== null && $this->inscripcion_hasta->isPast();
    }

    public function sePuedeEditar(): bool
    {
        return !in_array($this->estado, ['finalizado', 'cancelado'], true);
    }

    public function avisarSeguidores(): void
    {
        $disertantes = $this->disertantes()->pluck('disertantes.id');

        User::where('id', '!=', $this->organizador_id)
            ->where(function ($query) use ($disertantes) {
                $query->whereHas('categoriasSeguidas', fn ($q) => $q->whereKey($this->categoria_id))
                    ->orWhereHas('disertantesSeguidos', fn ($q) => $q->whereIn('disertantes.id', $disertantes));
            })
            ->get()
            ->each(fn ($usuario) => Mail::to($usuario)->queue(new EventoPublicado($this, $usuario)));
    }

    public function puedeGestionar(User $usuario): bool
    {
        return $this->organizador_id === $usuario->id || $usuario->hasRole('admin');
    }
}
