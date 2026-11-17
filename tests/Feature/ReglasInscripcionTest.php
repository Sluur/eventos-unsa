<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Evento;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReglasInscripcionTest extends TestCase
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

    private function datosEvento(array $cambios = []): array
    {
        return array_merge([
            'titulo' => 'Evento de prueba',
            'descripcion' => 'Descripción',
            'fecha_inicio' => now()->addDays(5)->format('Y-m-d\TH:i'),
            'fecha_fin' => now()->addDays(5)->addHours(2)->format('Y-m-d\TH:i'),
            'categoria_id' => Categoria::where('nombre', 'Charla')->value('id'),
            'lugar_id' => Lugar::where('nombre', 'Aula Magna')->value('id'),
            'cupo' => 20,
            'estado' => 'publicado',
        ], $cambios);
    }

    public function test_categoria_con_documentacion_pide_descripcion()
    {
        $this->actingAs($this->usuario('rodrigo@eventos.test'))
            ->post('/categorias', [
                'nombre' => 'Congreso',
                'requiere_aprobacion' => true,
                'requiere_documentacion' => true,
                'documentacion_descripcion' => '',
            ])
            ->assertSessionHasErrors('documentacion_descripcion');
    }

    public function test_documentacion_sin_aprobacion_no_es_valido()
    {
        $this->actingAs($this->usuario('rodrigo@eventos.test'))
            ->post('/categorias', [
                'nombre' => 'Congreso',
                'requiere_aprobacion' => false,
                'requiere_documentacion' => true,
                'documentacion_descripcion' => 'Constancia de inscripción',
            ])
            ->assertSessionHasErrors('requiere_aprobacion');
    }

    public function test_crea_categoria_con_reglas_y_color()
    {
        $this->actingAs($this->usuario('rodrigo@eventos.test'))
            ->post('/categorias', [
                'nombre' => 'Congreso',
                'requiere_aprobacion' => true,
                'requiere_documentacion' => true,
                'documentacion_descripcion' => 'Constancia de inscripción',
                'color' => '#ff8800',
            ])
            ->assertRedirect('/categorias');

        $categoria = Categoria::where('nombre', 'Congreso')->first();
        $this->assertTrue($categoria->requiere_documentacion);
        $this->assertSame('#ff8800', $categoria->color);
    }

    public function test_solo_registrados_por_defecto_y_abierto_al_publico()
    {
        $organizador = $this->usuario('organizador@eventos.test');

        $this->actingAs($organizador)->post('/eventos', $this->datosEvento(['titulo' => 'Cerrado']));
        $this->actingAs($organizador)->post('/eventos', $this->datosEvento(['titulo' => 'Abierto', 'solo_registrados' => false]));

        $this->assertTrue(Evento::where('titulo', 'Cerrado')->first()->solo_registrados);
        $this->assertFalse(Evento::where('titulo', 'Abierto')->first()->solo_registrados);
    }

    public function test_la_fecha_limite_tiene_que_ser_antes_del_inicio()
    {
        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->post('/eventos', $this->datosEvento([
                'inscripcion_hasta' => now()->addDays(6)->format('Y-m-d\TH:i'),
            ]))
            ->assertSessionHasErrors('inscripcion_hasta');
    }

    public function test_despues_de_la_fecha_limite_no_se_puede_inscribir()
    {
        $evento = Evento::where('titulo', 'Cómo funciona Internet')->firstOrFail();

        $this->actingAs($this->usuario('franco@eventos.test'))
            ->post("/eventos/{$evento->id}/inscripcion")
            ->assertSessionHas('error');

        $this->assertFalse($evento->inscripciones()->where('user_id', $this->usuario('franco@eventos.test')->id)->exists());
    }

    public function test_antes_de_la_fecha_limite_se_puede_inscribir()
    {
        $evento = Evento::where('titulo', 'Git y GitHub para trabajos en grupo')->firstOrFail();

        $this->actingAs($this->usuario('oriana@eventos.test'))
            ->post("/eventos/{$evento->id}/inscripcion")
            ->assertSessionHas('success');
    }

    public function test_el_evento_guarda_la_categoria_elegida()
    {
        $curso = Categoria::where('nombre', 'Curso')->value('id');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->post('/eventos', $this->datosEvento(['categoria_id' => $curso]))
            ->assertSessionHasNoErrors();

        $this->assertSame($curso, Evento::where('titulo', 'Evento de prueba')->value('categoria_id'));
    }
}
