<?php

namespace Tests\Feature;

use App\Models\Disertante;
use App\Models\Evento;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DisertantesTest extends TestCase
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

    private function disertante(string $email): Disertante
    {
        return Disertante::where('email', $email)->firstOrFail();
    }

    private function evento(string $titulo): Evento
    {
        return Evento::where('titulo', $titulo)->firstOrFail();
    }

    private function datos(array $cambios = []): array
    {
        return array_merge([
            'nombre' => 'Laura',
            'apellido' => 'Sosa',
            'email' => 'laura.sosa@eventos.test',
            'biografia' => 'Profesora de Matemática Discreta.',
        ], $cambios);
    }

    public function test_el_organizador_crea_un_disertante_con_datos_validos()
    {
        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->post('/disertantes', $this->datos())
            ->assertRedirect('/disertantes')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('disertantes', [
            'email' => 'laura.sosa@eventos.test',
            'nombre' => 'Laura',
            'activo' => true,
        ]);
    }

    public function test_los_campos_obligatorios_vacios_o_con_espacios_no_pasan()
    {
        $organizador = $this->usuario('organizador@eventos.test');

        foreach (['', '   '] as $valor) {
            $this->actingAs($organizador)
                ->post('/disertantes', $this->datos(['nombre' => $valor, 'apellido' => $valor, 'email' => $valor]))
                ->assertSessionHasErrors([
                    'nombre' => 'El campo nombre es obligatorio.',
                    'apellido' => 'El campo apellido es obligatorio.',
                    'email' => 'El campo email es obligatorio.',
                ]);
        }

        $this->assertSame(3, Disertante::count());
    }

    public function test_email_invalido_o_repetido_no_pasa()
    {
        $organizador = $this->usuario('organizador@eventos.test');

        $this->actingAs($organizador)
            ->post('/disertantes', $this->datos(['email' => 'laura-sin-arroba']))
            ->assertSessionHasErrors(['email' => 'El campo email tiene que ser un email válido.']);

        $this->actingAs($organizador)
            ->post('/disertantes', $this->datos(['email' => 'diego@eventos.test']))
            ->assertSessionHasErrors(['email' => 'Ya existe un disertante con ese email.']);

        $this->assertSame(3, Disertante::count());
    }

    public function test_editar_manteniendo_el_mismo_email_esta_permitido()
    {
        $diego = $this->disertante('diego@eventos.test');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->put("/disertantes/{$diego->id}", $this->datos([
                'nombre' => 'Diego Martín',
                'apellido' => 'Rodríguez',
                'email' => 'diego@eventos.test',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect('/disertantes');

        $this->assertSame('Diego Martín', $diego->fresh()->nombre);
    }

    public function test_los_textos_que_superan_el_maximo_no_pasan()
    {
        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->post('/disertantes', $this->datos([
                'nombre' => str_repeat('a', 101),
                'apellido' => str_repeat('b', 101),
                'email' => str_repeat('c', 140).'@eventos.test',
                'biografia' => str_repeat('d', 501),
            ]))
            ->assertSessionHasErrors([
                'nombre' => 'El campo nombre no puede superar 100 caracteres.',
                'apellido' => 'El campo apellido no puede superar 100 caracteres.',
                'email' => 'El campo email no puede superar 150 caracteres.',
                'biografia' => 'El campo biografía no puede superar 500 caracteres.',
            ]);

        $this->assertSame(3, Disertante::count());
    }

    public function test_se_elimina_un_disertante_sin_eventos()
    {
        $laura = Disertante::create($this->datos());

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->delete("/disertantes/{$laura->id}")
            ->assertRedirect('/disertantes')
            ->assertSessionHas('success');

        $this->assertModelMissing($laura);
    }

    public function test_no_se_elimina_un_disertante_con_eventos()
    {
        $diego = $this->disertante('diego@eventos.test');
        $git = $this->evento('Git y GitHub para trabajos en grupo');

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->delete("/disertantes/{$diego->id}")
            ->assertRedirect('/disertantes')
            ->assertSessionHas('error', 'No se puede eliminar: el disertante está asignado a eventos. Podés desactivarlo.');

        $this->assertModelExists($diego);
        $this->assertTrue($git->disertantes()->whereKey($diego->id)->exists());
    }

    public function test_un_disertante_inactivo_no_aparece_para_eventos_nuevos_pero_sigue_en_los_suyos()
    {
        $carlos = $this->disertante('carlos@eventos.test');
        $sql = $this->evento('Introducción a SQL');
        $organizador = $this->usuario('organizador@eventos.test');

        $this->actingAs($organizador)
            ->patch("/disertantes/{$carlos->id}/activo")
            ->assertSessionHas('success');

        $this->assertFalse($carlos->fresh()->activo);

        $this->actingAs($organizador)
            ->get('/eventos/create')
            ->assertInertia(fn ($page) => $page
                ->where('disertantes', fn ($disertantes) => !collect($disertantes)->pluck('id')->contains($carlos->id)));

        $this->actingAs($organizador)
            ->get("/eventos/{$sql->id}")
            ->assertInertia(fn ($page) => $page
                ->where('evento.disertantes', fn ($disertantes) => collect($disertantes)->pluck('id')->contains($carlos->id)));

        // al volver a activarlo aparece de nuevo
        $this->actingAs($organizador)->patch("/disertantes/{$carlos->id}/activo");
        $this->assertTrue($carlos->fresh()->activo);
    }

    public function test_borrar_directo_en_la_base_deja_el_evento_sin_ese_disertante_y_borra_seguidores()
    {
        $carlos = $this->disertante('carlos@eventos.test');
        $sql = $this->evento('Introducción a SQL');

        $this->assertSame(1, DB::table('disertante_user')->where('disertante_id', $carlos->id)->count());

        Disertante::query()->whereKey($carlos->id)->delete();

        $this->assertModelExists($sql);
        $this->assertSame(0, $sql->disertantes()->count());
        $this->assertSame(0, DB::table('disertante_evento')->where('disertante_id', $carlos->id)->count());
        $this->assertSame(0, DB::table('disertante_user')->where('disertante_id', $carlos->id)->count());
    }

    public function test_el_alumno_no_puede_gestionar_disertantes()
    {
        $oriana = $this->usuario('oriana@eventos.test');
        $diego = $this->disertante('diego@eventos.test');

        $this->actingAs($oriana)->get('/disertantes')->assertForbidden();
        $this->actingAs($oriana)->get('/disertantes/create')->assertForbidden();
        $this->actingAs($oriana)->post('/disertantes', $this->datos())->assertForbidden();
        $this->actingAs($oriana)->get("/disertantes/{$diego->id}/edit")->assertForbidden();
        $this->actingAs($oriana)->put("/disertantes/{$diego->id}", $this->datos())->assertForbidden();
        $this->actingAs($oriana)->patch("/disertantes/{$diego->id}/activo")->assertForbidden();
        $this->actingAs($oriana)->delete("/disertantes/{$diego->id}")->assertForbidden();

        $this->assertSame(3, Disertante::count());
        $this->assertTrue($diego->fresh()->activo);
    }

    public function test_el_organizador_puede_gestionar_disertantes()
    {
        $organizador = $this->usuario('organizador@eventos.test');
        $diego = $this->disertante('diego@eventos.test');

        $this->actingAs($organizador)->get('/disertantes')->assertOk();
        $this->actingAs($organizador)->get('/disertantes/create')->assertOk();
        $this->actingAs($organizador)->get("/disertantes/{$diego->id}/edit")->assertOk();
        $this->actingAs($organizador)->get('/disertantes?estado=inactivos')
            ->assertInertia(fn ($page) => $page->component('Disertantes/Index')->has('disertantes', 0));
    }

    public function test_un_script_en_la_biografia_se_guarda_como_texto()
    {
        $biografia = '<script>alert("hola")</script> Profesora de Física.';

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->post('/disertantes', $this->datos(['biografia' => $biografia]))
            ->assertSessionHasNoErrors();

        $laura = $this->disertante('laura.sosa@eventos.test');
        $this->assertSame($biografia, $laura->biografia);

        $this->actingAs($this->usuario('organizador@eventos.test'))
            ->get("/disertantes/{$laura->id}/edit")
            ->assertInertia(fn ($page) => $page->where('disertante.biografia', $biografia));
    }
}
