<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Envelope;

class InscripcionAceptada extends MailDeInscripcion
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Inscripción aceptada: '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.inscripcion-aceptada';
    }
}
