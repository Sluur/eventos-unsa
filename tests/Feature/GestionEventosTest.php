<?php

namespace Tests\Feature;

use App\Models\Evento;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GestionEventosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    private function usuario(string $email): User
    {
        return User::where('email', $email)->firstOrFail();
    }

    private function evento(string $titulo): Evento
    {
        return Evento::where('titulo', $titulo)->firstOrFail();
    }

    private function datos(Evento $evento, array $cambios = []): array
    {
        return array_merge([
            'titulo' => $evento->titulo,
            'descripcion' => $evento->descripcion,
            'fecha_inicio' => $evento->fecha_inicio->format('Y-m-d\TH:i'),
            'categoria_id' => $evento->categoria_id,
            'lugar_id' => $evento->lugar_id,
            'cupo' => $evento->cupo,
            'estado' => $evento->estado,
            'disertantes' => $evento->disertantes()->pluck('disertantes.id')->all(),
        ], $cambios);
    }

    public function test_el_evento_necesita_al_menos_un_disertante()
    {
        $evento = $this->evento('Cómo funciona Internet');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->put("/eventos/{$evento->id}", $this->datos($evento, ['disertantes' => []]))
            ->assertSessionHasErrors(['disertantes' => 'Elegí al menos un disertante.']);

        $this->assertTrue($evento->disertantes()->exists());
    }

    public function test_el_organizador_edita_su_evento()
    {
        $evento = $this->evento('Cómo funciona Internet');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->put("/eventos/{$evento->id}", $this->datos($evento, ['titulo' => 'Redes para todos']))
            ->assertRedirect("/eventos/{$evento->id}");

        $this->assertSame('Redes para todos', $evento->fresh()->titulo);
    }

    public function test_no_se_puede_bajar_el_cupo_debajo_de_los_inscriptos()
    {
        $evento = $this->evento('Introducción a SQL');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->put("/eventos/{$evento->id}", $this->datos($evento, ['cupo' => 2]))
            ->assertSessionHasErrors('cupo');
    }

    public function test_un_alumno_no_puede_editar()
    {
        $evento = $this->evento('Cómo funciona Internet');

        $this->actingAs($this->usuario('oriana@eventos.test'))
            ->get("/eventos/{$evento->id}/edit")
            ->assertForbidden();
    }

    public function test_otro_organizador_recibe_403()
    {
        $otro = User::factory()->create();
        $otro->assignRole('organizador');
        $evento = $this->evento('Cómo funciona Internet');

        $this->actingAs($otro)->get("/eventos/{$evento->id}/edit")->assertForbidden();
    }

    public function test_un_evento_finalizado_no_se_edita()
    {
        $evento = $this->evento('Taller de Linux desde cero');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->get("/eventos/{$evento->id}/edit")
            ->assertRedirect("/eventos/{$evento->id}")
            ->assertSessionHas('error');
    }

    public function test_cancelar_guarda_el_motivo_y_cierra_la_inscripcion()
    {
        $evento = $this->evento('Cómo funciona Internet');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->patch("/eventos/{$evento->id}/cancelar", ['motivo' => 'Se suspende por paro docente.'])
            ->assertSessionHas('success');

        $evento->refresh();
        $this->assertSame('cancelado', $evento->estado);
        $this->assertSame('Se suspende por paro docente.', $evento->motivo_cancelacion);

        // la inscripta lo sigue viendo pero no puede cancelar
        $oriana = $this->usuario('oriana@eventos.test');
        $this->actingAs($oriana)->get("/eventos/{$evento->id}")->assertOk();
        $this->actingAs($oriana)->delete("/eventos/{$evento->id}/inscripcion")->assertSessionHas('error');

        // y otro alumno no se puede inscribir
        $this->actingAs($this->usuario('franco@eventos.test'))
            ->post("/eventos/{$evento->id}/inscripcion")
            ->assertSessionHas('error', 'El evento fue cancelado.');
    }

    public function test_cancelar_pide_motivo()
    {
        $evento = $this->evento('Cómo funciona Internet');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->patch("/eventos/{$evento->id}/cancelar", ['motivo' => ''])
            ->assertSessionHasErrors('motivo');
    }

    public function test_duplicar_precarga_los_datos_sin_fechas()
    {
        $evento = $this->evento('Introducción a las APIs REST');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->get("/eventos/create?duplicar={$evento->id}")
            ->assertInertia(fn ($page) => $page
                ->component('Eventos/Create')
                ->where('copia.titulo', 'Introducción a las APIs REST (copia)')
                ->where('copia.cupo', '30')
                ->has('copia.disertantes', 2)
                ->missing('copia.fecha_inicio'));
    }

    public function test_subir_reemplazar_y_quitar_imagen()
    {
        Storage::fake('public');
        $organizador = $this->usuario('organizador@eventos.test');
        $evento = $this->evento('Cómo funciona Internet');

        $this->actingAs($organizador)->put("/eventos/{$evento->id}", $this->datos($evento, [
            'imagen' => UploadedFile::fake()->create('portada.jpg', 300, 'image/jpeg'),
        ]))->assertSessionHasNoErrors();

        $primera = $evento->fresh()->imagen;
        Storage::disk('public')->assertExists($primera);

        $this->actingAs($organizador)->put("/eventos/{$evento->id}", $this->datos($evento, [
            'imagen' => UploadedFile::fake()->create('otra.png', 300, 'image/png'),
        ]));

        $segunda = $evento->fresh()->imagen;
        Storage::disk('public')->assertMissing($primera);
        Storage::disk('public')->assertExists($segunda);

        $this->actingAs($organizador)->put("/eventos/{$evento->id}", $this->datos($evento, ['quitar_imagen' => true]));

        Storage::disk('public')->assertMissing($segunda);
        $this->assertNull($evento->fresh()->imagen);
    }

    public function test_la_imagen_se_valida()
    {
        Storage::fake('public');
        $evento = $this->evento('Cómo funciona Internet');
        $organizador = $this->usuario('organizador@eventos.test');

        $this->actingAs($organizador)->put("/eventos/{$evento->id}", $this->datos($evento, [
            'imagen' => UploadedFile::fake()->create('apunte.pdf', 100, 'application/pdf'),
        ]))->assertSessionHasErrors('imagen');

        $this->actingAs($organizador)->put("/eventos/{$evento->id}", $this->datos($evento, [
            'imagen' => UploadedFile::fake()->create('grande.jpg', 3000, 'image/jpeg'),
        ]))->assertSessionHasErrors(['imagen' => 'La imagen no puede pesar más de 2 MB.']);
    }

    public function test_solo_se_elimina_sin_inscripciones()
    {
        $organizador = $this->usuario('organizador@eventos.test');
        $conInscriptos = $this->evento('Cómo funciona Internet');
        $borrador = $this->evento('Introducción a las APIs REST');

        $this->actingAs($organizador)->delete("/eventos/{$conInscriptos->id}")->assertSessionHas('error');
        $this->assertModelExists($conInscriptos);

        $this->actingAs($organizador)->delete("/eventos/{$borrador->id}")->assertRedirect('/eventos');
        $this->assertModelMissing($borrador);
    }
}
