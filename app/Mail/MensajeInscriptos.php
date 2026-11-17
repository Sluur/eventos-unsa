<?php

namespace App\Mail;

use App\Models\Inscripcion;
use Illuminate\Mail\Mailables\Envelope;

class MensajeInscriptos extends MailDeInscripcion
{
    public function __construct(Inscripcion $inscripcion, public string $asunto, public string $cuerpo)
    {
        parent::__construct($inscripcion);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->asunto.' - '.$this->inscripcion->evento->titulo);
    }

    protected function vista(): string
    {
        return 'mail.mensaje-inscriptos';
    }

    protected function datos(): array
    {
        return ['cuerpo' => $this->cuerpo];
    }
}
