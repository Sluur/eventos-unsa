<?php

namespace App\Mail;

use App\Models\Inscripcion;
use Illuminate\Mail\Mailables\Envelope;

class EventoModificado extends MailDeInscripcion
{
    /**
     * @param  array<int, array{campo: string, antes: string, ahora: string}>  $cambios
     */
    public function __construct(Inscripcion $inscripcion, public array $cambios)
    {
        parent::__construct($inscripcion);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Cambios en el evento: '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.evento-modificado';
    }

    protected function datos(): array
    {
        return ['cambios' => $this->cambios];
    }
}
