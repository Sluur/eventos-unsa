<?php

namespace Tests\Feature;

use App\Mail\InscripcionConfirmada;
use App\Models\Categoria;
use App\Models\Evento;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MailsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
        Mail::fake();
    }

    private function usuario(string $email): User
    {
        return User::where('email', $email)->firstOrFail();
    }

    private function evento(string $titulo): Evento
    {
        return Evento::where('titulo', $titulo)->firstOrFail();
    }

    private function eventoDe(string $categoria, bool $soloRegistrados = true): Evento
    {
        return Evento::create([
            'titulo' => "Evento de {$categoria}",
            'descripcion' => 'Prueba',
            'fecha_inicio' => now()->addDays(5),
            'fecha_fin' => now()->addDays(5)->addHours(2),
            'cupo' => 10,
            'solo_registrados' => $soloRegistrados,
            'estado' => 'publicado',
            'categoria_id' => Categoria::where('nombre', $categoria)->value('id'),
            'lugar_id' => Lugar::value('id'),
            'organizador_id' => $this->usuario('organizador@eventos.test')->id,
        ]);
    }

    public function test_b1_confirmacion_al_inscribirse_directo()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');

        $this->actingAs($this->usuario('oriana@eventos.test'))->post("/eventos/{$git->id}/inscripcion");

        Mail::assertQueued(InscripcionConfirmada::class, fn ($mail) => $mail->hasTo('oriana@eventos.test')
            && $mail->inscripcion->evento_id === $git->id);
    }

    public function test_b1_confirmacion_al_invitado()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');

        $this->post("/cartelera/{$git->id}/inscripcion", [
            'nombre' => 'Ana', 'apellido' => 'Pérez', 'email' => 'ana@example.com', 'dni' => '42111222',
        ]);

        Mail::assertQueued(InscripcionConfirmada::class, fn ($mail) => $mail->hasTo('ana@example.com'));
    }

    public function test_b1_no_se_manda_si_queda_pendiente()
    {
        $taller = $this->eventoDe('Taller');

        $this->actingAs($this->usuario('oriana@eventos.test'))->post("/eventos/{$taller->id}/inscripcion");

        Mail::assertNotQueued(InscripcionConfirmada::class);
    }

    public function test_el_mail_lleva_los_datos_del_evento()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');
        $inscripcion = $git->inscripciones()->whereNull('user_id')->first();

        (new InscripcionConfirmada($inscripcion))
            ->assertHasSubject('Inscripción confirmada: Git y GitHub para trabajos en grupo')
            ->assertSeeInHtml('Lucía Gómez')
            ->assertSeeInHtml('Aula 101')
            ->assertSeeInHtml(route('cartelera.show', $git))
            ->assertDontSeeInHtml('cancelá la inscripción');
    }
}
