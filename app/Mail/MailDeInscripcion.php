<?php

namespace App\Mail;

use App\Models\Inscripcion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

// Base de los mails que reciben los inscriptos: saludo, datos del evento y botón "Ver evento"
abstract class MailDeInscripcion extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Inscripcion $inscripcion)
    {
    }

    abstract protected function vista(): string;

    // Datos propios de cada mail
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

    // El registrado va al panel; el invitado a la cartelera, si el evento sigue publicado
    protected function urlEvento(): ?string
    {
        $evento = $this->inscripcion->evento;

        if ($this->inscripcion->user_id) {
            return route('eventos.show', $evento);
        }

        return $evento->estado === 'publicado' ? route('cartelera.show', $evento) : null;
    }
}
