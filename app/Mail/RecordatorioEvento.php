<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Envelope;

class RecordatorioEvento extends MailDeInscripcion
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Recordatorio: '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.recordatorio-evento';
    }
}
