<?php

namespace Tests\Feature;

use App\Models\Evento;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'fecha_fin' => $evento->fecha_fin->format('Y-m-d\TH:i'),
            'lugar_id' => $evento->lugar_id,
            'cupo' => $evento->cupo,
            'estado' => $evento->estado,
            'disertantes' => $evento->disertantes()->pluck('disertantes.id')->all(),
        ], $cambios);
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
