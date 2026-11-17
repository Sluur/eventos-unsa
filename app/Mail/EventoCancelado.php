<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Envelope;

class EventoCancelado extends MailDeInscripcion
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Evento cancelado: '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.evento-cancelado';
    }

    protected function datos(): array
    {
        return ['motivo' => $this->inscripcion->evento->motivo_cancelacion];
    }
}
