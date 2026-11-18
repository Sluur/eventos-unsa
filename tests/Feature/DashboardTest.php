<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function usuario(string $email): User
    {
        return User::where('email', $email)->firstOrFail();
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_un_usuario_sin_rol_no_entra_al_resumen()
    {
        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertForbidden();
    }

    public function test_el_organizador_ve_lo_pendiente_de_sus_eventos()
    {
        $this->seed();

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard/Index')
                ->where('rol', 'gestion')
                ->where('esAdmin', false)
                ->where('tarjetas.borradores', 1)
                ->where('pendientes', fn ($eventos) => collect($eventos)->pluck('titulo')->contains('Curso de Python inicial'))
                ->where('sinAsistencia', fn ($eventos) => collect($eventos)->pluck('titulo')->contains('Primeros pasos con Arduino') === false));
    }

    public function test_el_alumno_ve_sus_inscripciones_y_certificados()
    {
        $this->seed();

        $this->actingAs($this->usuario('franco@eventos.test'))
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard/Index')
                ->where('rol', 'alumno')
                ->where('tarjetas.certificados', 2)
                ->where('tarjetas.encuestas', 2)
                ->where('proximas', fn ($inscripciones) => collect($inscripciones)->pluck('evento.titulo')->contains('Git y GitHub para trabajos en grupo')));
    }
}
