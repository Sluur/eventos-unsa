<?php

namespace Tests\Feature;

use App\Mail\EventoCancelado;
use App\Mail\EventoModificado;
use App\Mail\InscripcionAceptada;
use App\Mail\InscripcionConfirmada;
use App\Mail\InscripcionRechazada;
use App\Mail\InscripcionRecibida;
use App\Mail\MensajeInscriptos;
use App\Mail\RecordatorioEvento;
use App\Models\Categoria;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\Lugar;
use App\Models\MensajeEvento;
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

    public function test_b2_recibida_si_queda_pendiente()
    {
        $taller = $this->eventoDe('Taller');

        $this->actingAs($this->usuario('oriana@eventos.test'))->post("/eventos/{$taller->id}/inscripcion");

        Mail::assertNotQueued(InscripcionConfirmada::class);
        Mail::assertQueued(InscripcionRecibida::class, fn ($mail) => $mail->hasTo('oriana@eventos.test'));
    }

    public function test_b2_recibida_al_invitado_de_un_taller_abierto()
    {
        $taller = $this->eventoDe('Taller', soloRegistrados: false);

        $this->post("/cartelera/{$taller->id}/inscripcion", [
            'nombre' => 'Ana', 'apellido' => 'Pérez', 'email' => 'ana@example.com', 'dni' => '42111222',
        ]);

        Mail::assertQueued(InscripcionRecibida::class, fn ($mail) => $mail->hasTo('ana@example.com'));
    }

    public function test_b3_aceptada_y_rechazada_con_motivo()
    {
        $taller = $this->eventoDe('Taller');
        $organizador = $this->usuario('organizador@eventos.test');
        $oriana = Inscripcion::create(['user_id' => $this->usuario('oriana@eventos.test')->id, 'evento_id' => $taller->id, 'estado' => 'pendiente']);
        $franco = Inscripcion::create(['user_id' => $this->usuario('franco@eventos.test')->id, 'evento_id' => $taller->id, 'estado' => 'pendiente']);

        $this->actingAs($organizador)->patch("/inscripciones/{$oriana->id}/aceptar");
        $this->actingAs($organizador)->patch("/inscripciones/{$franco->id}/rechazar", ['motivo' => 'No cumple los requisitos']);

        Mail::assertQueued(InscripcionAceptada::class, fn ($mail) => $mail->hasTo('oriana@eventos.test'));
        Mail::assertQueued(InscripcionRechazada::class, fn ($mail) => $mail->hasTo('franco@eventos.test'));

        (new InscripcionRechazada($franco->fresh()))->assertSeeInHtml('No cumple los requisitos');
    }

    public function test_b4_recordatorio_una_sola_vez_a_los_confirmados()
    {
        $docker = $this->evento('Primeros pasos con Docker');

        $this->artisan('eventos:enviar-recordatorios')
            ->expectsOutput('Recordatorios enviados: 2')
            ->assertSuccessful();

        Mail::assertQueued(RecordatorioEvento::class, 2);
        Mail::assertQueued(RecordatorioEvento::class, fn ($mail) => $mail->hasTo('oriana@eventos.test')
            && $mail->inscripcion->evento_id === $docker->id);
        $this->assertSame(0, $docker->inscripciones()->whereNull('recordatorio_enviado_at')->count());

        // La segunda corrida no repite
        $this->artisan('eventos:enviar-recordatorios')->expectsOutput('Recordatorios enviados: 0');
    }

    private function datosEdicion(Evento $evento, array $cambios = []): array
    {
        return array_merge([
            'titulo' => $evento->titulo,
            'descripcion' => $evento->descripcion,
            'fecha_inicio' => $evento->fecha_inicio->format('Y-m-d\TH:i'),
            'fecha_fin' => $evento->fecha_fin->format('Y-m-d\TH:i'),
            'categoria_id' => $evento->categoria_id,
            'lugar_id' => $evento->lugar_id,
            'cupo' => $evento->cupo,
            'estado' => $evento->estado,
        ], $cambios);
    }

    public function test_b5_cancelado_avisa_con_el_motivo()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->patch("/eventos/{$git->id}/cancelar", ['motivo' => 'Se corta la luz en todo el edificio.']);

        // franco y los dos invitados
        Mail::assertQueued(EventoCancelado::class, 3);
        Mail::assertQueued(EventoCancelado::class, fn ($mail) => $mail->hasTo('lucia@eventos.test'));

        $inscripcion = $git->inscripciones()->whereNull('user_id')->first();
        (new EventoCancelado($inscripcion))->assertSeeInHtml('Se corta la luz en todo el edificio.');
    }

    public function test_b5_modificado_avisa_que_cambio()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');
        $magna = Lugar::where('nombre', 'Aula Magna')->value('id');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->put("/eventos/{$git->id}", $this->datosEdicion($git, ['lugar_id' => $magna]))
            ->assertSessionHasNoErrors();

        Mail::assertQueued(EventoModificado::class, 3);
        Mail::assertQueued(EventoModificado::class, fn ($mail) => $mail->cambios === [
            ['campo' => 'Lugar', 'antes' => 'Aula 101', 'ahora' => 'Aula Magna'],
        ]);
    }

    public function test_b5_cambiar_solo_el_titulo_no_avisa()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->put("/eventos/{$git->id}", $this->datosEdicion($git, ['titulo' => 'Git en equipo']));

        Mail::assertNotQueued(EventoModificado::class);
    }

    public function test_mensaje_a_inscriptos_segun_destinatarios_y_queda_en_el_historial()
    {
        $python = $this->evento('Curso de Python inicial');
        $organizador = $this->usuario('organizador@eventos.test');

        $this->actingAs($organizador)->post("/eventos/{$python->id}/mensajes", [
            'asunto' => 'Traer notebook',
            'cuerpo' => "Hola!
Traigan notebook con Python instalado.",
            'destinatarios' => 'pendientes',
        ])->assertSessionHas('success', 'Mensaje enviado a 1 inscripto.');

        Mail::assertQueued(MensajeInscriptos::class, 1);
        Mail::assertQueued(MensajeInscriptos::class, fn ($mail) => $mail->hasTo('oriana@eventos.test')
            && $mail->asunto === 'Traer notebook');

        $this->actingAs($organizador)->post("/eventos/{$python->id}/mensajes", [
            'asunto' => 'Aula',
            'cuerpo' => 'Cambiamos de aula.',
            'destinatarios' => 'todos',
        ]);

        // pendiente + confirmada; la rechazada no recibe
        Mail::assertQueued(MensajeInscriptos::class, 3);
        $this->assertSame([1, 2], MensajeEvento::where('evento_id', $python->id)->orderBy('id')->pluck('cantidad')->all());
    }

    public function test_mensaje_valida_y_solo_lo_manda_quien_gestiona()
    {
        $python = $this->evento('Curso de Python inicial');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->post("/eventos/{$python->id}/mensajes", ['asunto' => '', 'cuerpo' => '', 'destinatarios' => 'otros'])
            ->assertSessionHasErrors(['asunto', 'cuerpo', 'destinatarios']);

        $this->actingAs($this->usuario('oriana@eventos.test'))
            ->post("/eventos/{$python->id}/mensajes", ['asunto' => 'Hola', 'cuerpo' => 'Hola', 'destinatarios' => 'todos'])
            ->assertForbidden();
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
