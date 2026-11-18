<?php

namespace App\Mail;

use App\Models\Evento;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventoPublicado extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Evento $evento, public User $usuario)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Nuevo evento: '.$this->evento->titulo);
    }

    public function content(): Content
    {
        $evento = $this->evento->loadMissing(['lugar', 'categoria']);

        $disertantes = $evento->disertantes()
            ->whereHas('seguidores', fn ($query) => $query->whereKey($this->usuario->id))
            ->get()
            ->map(fn ($d) => "{$d->nombre} {$d->apellido}");

        return new Content(
            markdown: 'mail.evento-publicado',
            with: [
                'nombre' => $this->usuario->name,
                'evento' => $evento,
                'url' => route('eventos.show', $evento),
                'sigueCategoria' => $this->usuario->categoriasSeguidas()->whereKey($evento->categoria_id)->exists(),
                'disertantes' => $disertantes,
            ],
        );
    }
}
