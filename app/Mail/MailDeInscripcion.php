<?php

namespace App\Mail;

use App\Models\Inscripcion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

abstract class MailDeInscripcion extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Inscripcion $inscripcion)
    {
    }

    abstract protected function vista(): string;

    protected function datos(): array
    {
        return [];
    }

    public function content(): Content
    {
        $evento = $this->inscripcion->evento->loadMissing('lugar');

        return new Content(
            markdown: $this->vista(),
            with: [
                'nombre' => $this->inscripcion->nombreDestino(),
                'evento' => $evento,
                'url' => $this->urlEvento(),
                'invitado' => $this->inscripcion->user_id === null,
                ...$this->datos(),
            ],
        );
    }

    protected function urlEvento(): ?string
    {
        $evento = $this->inscripcion->evento;

        if ($this->inscripcion->user_id) {
            return route('eventos.show', $evento);
        }

        return $evento->estado === 'publicado' ? route('cartelera.show', $evento) : null;
    }
}
