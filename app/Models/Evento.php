<?php

namespace App\Models;

use App\Mail\EventoPublicado;
use Illuminate\Database\Eloquent\Builder;
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

    public function scopeFiltrar(Builder $query, array $filtros): void
    {
        $query->when($filtros['buscar'] !== '', fn ($q) => $q->where('titulo', 'like', "%{$filtros['buscar']}%"))
            ->when($filtros['categoria'] !== '', fn ($q) => $q->where('categoria_id', $filtros['categoria']));
    }

    public function scopeEnVista(Builder $query, string $vista, User $usuario): void
    {
        $proximos = fn ($q) => $q->where('estado', 'publicado')->where('fecha_fin', '>=', now());
        // los publicados que ya terminaron cuentan como finalizados aunque el comando no haya corrido
        $finalizados = fn ($q) => $q->where('estado', 'finalizado')
            ->orWhere(fn ($q) => $q->where('estado', 'publicado')->where('fecha_fin', '<', now()));

        match ($vista) {
            'proximos' => $query->where($proximos),
            'finalizados' => $query->where($finalizados),
            'todos' => $query->where(fn ($q) => $q->where($proximos)->orWhere($finalizados)),
            'borradores', 'cancelados' => $query
                ->where('estado', $vista === 'borradores' ? 'borrador' : 'cancelado')
                ->when(!$usuario->hasRole('admin'), fn ($q) => $q->where('organizador_id', $usuario->id)),
        };
    }

    public function scopeConProximo(Builder $query): void
    {
        // proximo = publicado y todavia no termino, sirve para separar los grupos en "todos"
        $query->select('eventos.*')
            ->selectRaw("case when estado = 'publicado' and fecha_fin >= ? then 1 else 0 end as proximo", [now()]);
    }

    public function scopeOrdenListado(Builder $query, array $filtros): void
    {
        $query->when($filtros['vista'] === 'todos', function ($q) {
            $q->orderByRaw("case when estado = 'publicado' and fecha_fin >= ? then 1 else 0 end desc", [now()]);
        });

        if ($filtros['orden'] !== '') {
            $query->orderBy($filtros['orden'], $filtros['direccion']);

            return;
        }

        match ($filtros['vista']) {
            'finalizados', 'cancelados' => $query->orderByDesc('fecha_inicio'),
            'todos' => $query
                ->orderByRaw("case when estado = 'publicado' and fecha_fin >= ? then fecha_inicio end asc", [now()])
                ->orderByDesc('fecha_inicio'),
            default => $query->orderBy('fecha_inicio'),
        };
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
