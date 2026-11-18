<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';

    // pendientes tambien reservan cupo
    public const ACTIVAS = ['pendiente', 'confirmada'];

    protected $fillable = [
        'user_id',
        'nombre_invitado',
        'apellido_invitado',
        'email_invitado',
        'dni_invitado',
        'evento_id',
        'estado',
        'asistio',
        'archivo',
        'motivo_rechazo',
        'revisado_por',
        'revisado_at',
        'recordatorio_enviado_at',
    ];

    protected function casts(): array
    {
        return [
            'asistio' => 'boolean',
            'revisado_at' => 'datetime',
            'recordatorio_enviado_at' => 'datetime',
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

    public function emailDestino(): string
    {
        return $this->user?->email ?? $this->email_invitado;
    }

    public function nombreDestino(): string
    {
        return $this->user?->name ?? trim("{$this->nombre_invitado} {$this->apellido_invitado}");
    }

    public function avisar(Mailable $mail): void
    {
        Mail::to($this->emailDestino(), $this->nombreDestino())->queue($mail);
    }

    public function encuesta()
    {
        return $this->hasOne(Encuesta::class);
    }

    public function urlEncuesta(bool $firmada = false): string
    {
        return $firmada ? URL::signedRoute('encuestas.create', $this) : route('encuestas.create', $this);
    }

    public function urlCertificado(bool $firmada = false): string
    {
        return $firmada ? URL::signedRoute('inscripciones.certificado', $this) : route('inscripciones.certificado', $this);
    }

    public function puedeResponderEncuesta(): bool
    {
        return $this->asistio
            && ($this->evento->estado === 'finalizado' || $this->evento->fecha_fin->isPast());
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
