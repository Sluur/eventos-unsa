<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Evento;
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

    public function test_la_cartelera_se_ve_sin_sesion_y_solo_muestra_proximos_publicados()
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Cartelera/Index')
                ->where('eventos.data', fn ($eventos) => collect($eventos)->every(
                    fn ($e) => $e['estado'] === 'publicado'
                ))
                ->where('eventos.data', fn ($eventos) => !collect($eventos)->pluck('titulo')->contains('Introducción a SQL')));
    }

    public function test_filtra_por_categoria_y_busqueda()
    {
        $curso = Categoria::where('nombre', 'Curso')->value('id');

        $this->get("/?categoria={$curso}")
            ->assertInertia(fn ($page) => $page->has('eventos.data', 1)->where('eventos.data.0.titulo', 'Curso de Python inicial'));

        $this->get('/?buscar=internet')
            ->assertInertia(fn ($page) => $page->has('eventos.data', 1)->where('eventos.data.0.titulo', 'Cómo funciona Internet'));
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
