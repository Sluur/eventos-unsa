<?php

namespace Tests\Feature;

use App\Models\Evento;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarteleraTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    private function evento(string $titulo): Evento
    {
        return Evento::where('titulo', $titulo)->firstOrFail();
    }

    public function test_la_portada_muestra_proximos_publicados_ordenados()
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Cartelera/Index')
                ->where('eventos', function ($eventos) {
                    $eventos = collect($eventos);
                    $fechas = $eventos->pluck('fecha_inicio');

                    return $eventos->count() <= 6
                        && $eventos->every(fn ($e) => $e['estado'] === 'publicado')
                        && !$eventos->pluck('titulo')->contains('Introducción a SQL')
                        && $fechas->values()->all() === $fechas->sort()->values()->all();
                }));
    }

    public function test_con_sesion_la_portada_y_el_detalle_publico_van_a_eventos()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');
        $this->actingAs(User::where('email', 'oriana@eventos.test')->first());

        $this->get('/')->assertRedirect('/eventos');
        $this->get("/cartelera/{$git->id}")->assertRedirect("/eventos/{$git->id}");
    }

    public function test_detalle_publico_sin_inscriptos_y_404_para_borradores()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');

        $this->get("/cartelera/{$git->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Cartelera/Show')
                ->missing('inscriptos')
                ->missing('evento.inscripciones'));

        $this->get('/cartelera/'.$this->evento('Introducción a las APIs REST')->id)->assertNotFound();
    }

    public function test_iniciar_sesion_vuelve_al_evento()
    {
        $git = $this->evento('Git y GitHub para trabajos en grupo');

        $this->get("/cartelera/{$git->id}/ingresar")->assertRedirect('/login');

        $this->post('/login', ['email' => 'oriana@eventos.test', 'password' => 'password'])
            ->assertRedirect("/cartelera/{$git->id}/ingresar");

        $this->get("/cartelera/{$git->id}/ingresar")->assertRedirect("/eventos/{$git->id}");
    }
}
