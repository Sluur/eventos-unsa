<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\Lugar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InscripcionAprobacionTest extends TestCase
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

    private function eventoDe(string $categoria, int $cupo = 10): Evento
    {
        return Evento::create([
            'titulo' => "Evento de {$categoria}",
            'descripcion' => 'Prueba',
            'fecha_inicio' => now()->addDays(5),
            'fecha_fin' => now()->addDays(5)->addHours(2),
            'cupo' => $cupo,
            'estado' => 'publicado',
            'categoria_id' => Categoria::where('nombre', $categoria)->value('id'),
            'lugar_id' => Lugar::value('id'),
            'organizador_id' => $this->usuario('organizador@eventos.test')->id,
        ]);
    }

    private function estadoDe(Evento $evento, string $email): ?string
    {
        return Inscripcion::where('evento_id', $evento->id)
            ->where('user_id', $this->usuario($email)->id)
            ->value('estado');
    }

    public function test_charla_queda_confirmada_y_taller_pendiente()
    {
        $charla = $this->eventoDe('Charla');
        $taller = $this->eventoDe('Taller');
        $oriana = $this->usuario('oriana@eventos.test');

        $this->actingAs($oriana)->post("/eventos/{$charla->id}/inscripcion");
        $this->actingAs($oriana)->post("/eventos/{$taller->id}/inscripcion");

        $this->assertSame('confirmada', $this->estadoDe($charla, 'oriana@eventos.test'));
        $this->assertSame('pendiente', $this->estadoDe($taller, 'oriana@eventos.test'));
    }

    public function test_las_pendientes_ocupan_lugar()
    {
        $taller = $this->eventoDe('Taller', cupo: 1);

        $this->actingAs($this->usuario('oriana@eventos.test'))->post("/eventos/{$taller->id}/inscripcion");

        $this->actingAs($this->usuario('franco@eventos.test'))
            ->post("/eventos/{$taller->id}/inscripcion")
            ->assertSessionHas('error', 'No quedan lugares disponibles.');
    }

    public function test_rechazada_puede_volver_a_inscribirse()
    {
        $taller = $this->eventoDe('Taller');
        $oriana = $this->usuario('oriana@eventos.test');

        Inscripcion::create([
            'user_id' => $oriana->id,
            'evento_id' => $taller->id,
            'estado' => 'rechazada',
            'motivo_rechazo' => 'Faltan datos',
        ]);

        $this->actingAs($oriana)->post("/eventos/{$taller->id}/inscripcion")->assertSessionHas('success');

        $inscripcion = Inscripcion::where('evento_id', $taller->id)->where('user_id', $oriana->id)->sole();
        $this->assertSame('pendiente', $inscripcion->estado);
        $this->assertNull($inscripcion->motivo_rechazo);
    }
}
