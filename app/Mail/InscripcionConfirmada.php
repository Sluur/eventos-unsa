<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Envelope;

class InscripcionConfirmada extends MailDeInscripcion
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Inscripción confirmada: '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.inscripcion-confirmada';
    }
}
