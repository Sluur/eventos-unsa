<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Envelope;

class CertificadoDisponible extends MailDeInscripcion
{
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Tu certificado: '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.certificado-disponible';
    }

    protected function datos(): array
    {
        return ['url' => $this->inscripcion->urlEncuesta(firmada: true)];
    }
}
