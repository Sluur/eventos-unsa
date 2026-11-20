<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InscripcionInvitadoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    private function git(): Evento
    {
        return Evento::where('titulo', 'Git y GitHub para trabajos en grupo')->firstOrFail();
    }

    private function datos(array $cambios = []): array
    {
        return array_merge([
            'nombre' => 'Ana',
            'apellido' => 'Pérez',
            'email' => 'ana.perez@example.com',
            'dni' => '42111222',
        ], $cambios);
    }

    public function test_un_invitado_se_inscribe_a_un_evento_abierto()
    {
        $git = $this->git();

        $this->post("/cartelera/{$git->id}/inscripcion", $this->datos())->assertSessionHas('success');

        $inscripcion = Inscripcion::where('email_invitado', 'ana.perez@example.com')->sole();
        $this->assertNull($inscripcion->user_id);
        $this->assertSame('confirmada', $inscripcion->estado);
    }

    public function test_no_se_repite_email_ni_dni_y_respeta_el_cupo()
    {
        $git = $this->git();

        // ya está la invitada del seeder con ese email
        $this->post("/cartelera/{$git->id}/inscripcion", $this->datos(['email' => 'lucia@eventos.test']))
            ->assertSessionHasErrors('email');
        $this->post("/cartelera/{$git->id}/inscripcion", $this->datos(['dni' => '41234567']))
            ->assertSessionHasErrors('dni');

        // queda un lugar: la primera entra, la segunda no
        $this->post("/cartelera/{$git->id}/inscripcion", $this->datos())->assertSessionHas('success');
        $this->post("/cartelera/{$git->id}/inscripcion", $this->datos(['email' => 'otra@example.com', 'dni' => '43000111']))
            ->assertSessionHas('error', 'No quedan lugares disponibles.');
    }

    public function test_en_evento_solo_registrados_no_se_puede()
    {
        $internet = Evento::where('titulo', 'Curso de Python inicial')->firstOrFail();

        $this->post("/cartelera/{$internet->id}/inscripcion", $this->datos())->assertSessionHas('error');
        $this->assertFalse(Inscripcion::where('email_invitado', 'ana.perez@example.com')->exists());
    }

    public function test_curso_abierto_pide_archivo_y_queda_pendiente()
    {
        Storage::fake('local');
        $curso = Evento::create([
            'titulo' => 'Curso abierto',
            'descripcion' => 'Prueba',
            'fecha_inicio' => now()->addDays(5),
            'cupo' => 10,
            'solo_registrados' => false,
            'estado' => 'publicado',
            'categoria_id' => Categoria::where('nombre', 'Curso')->value('id'),
            'lugar_id' => Lugar::value('id'),
            'organizador_id' => User::where('email', 'organizador@eventos.test')->value('id'),
        ]);

        $this->post("/cartelera/{$curso->id}/inscripcion", $this->datos())->assertSessionHasErrors('archivo');

        $this->post("/cartelera/{$curso->id}/inscripcion", $this->datos([
            'archivo' => UploadedFile::fake()->create('certificado.pdf', 100, 'application/pdf'),
        ]))->assertSessionHas('success');

        $inscripcion = Inscripcion::where('evento_id', $curso->id)->sole();
        $this->assertSame('pendiente', $inscripcion->estado);
        Storage::disk('local')->assertExists($inscripcion->archivo);
    }

    public function test_el_dni_tiene_que_ser_valido()
    {
        $this->post("/cartelera/{$this->git()->id}/inscripcion", $this->datos(['dni' => '12.345.678']))
            ->assertSessionHasErrors('dni');
    }

    public function test_throttle_corta_despues_de_cinco_intentos()
    {
        $git = $this->git();

        for ($i = 0; $i < 5; $i++) {
            $this->post("/cartelera/{$git->id}/inscripcion", $this->datos(['dni' => 'x']));
        }

        $this->post("/cartelera/{$git->id}/inscripcion", $this->datos())->assertStatus(429);
    }
}
