<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Envelope;

class InscripcionRechazada extends MailDeInscripcion
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Inscripción rechazada: '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.inscripcion-rechazada';
    }

    protected function datos(): array
    {
        return ['motivo' => $this->inscripcion->motivo_rechazo];
    }
}
