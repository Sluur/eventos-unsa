<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Envelope;

class InscripcionRecibida extends MailDeInscripcion
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Recibimos tu inscripción: '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.inscripcion-recibida';
    }

    protected function datos(): array
    {
        return ['conDocumentacion' => $this->inscripcion->archivo !== null];
    }
}
