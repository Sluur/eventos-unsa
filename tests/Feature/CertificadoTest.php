<?php

namespace Tests\Feature;

use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class CertificadoTest extends TestCase
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

    private function inscripcion(string $titulo, string $email): Inscripcion
    {
        return Inscripcion::whereRelation('evento', 'titulo', $titulo)
            ->whereRelation('user', 'email', $email)
            ->firstOrFail();
    }

    private function invitada(): Inscripcion
    {
        $inscripcion = Inscripcion::where('email_invitado', 'sofia@eventos.test')->firstOrFail();
        $inscripcion->update(['asistio' => true]);

        return $inscripcion;
    }

    public function test_sin_asistencia_no_hay_certificado()
    {
        $oriana = $this->usuario('oriana@eventos.test');
        $inscripcion = $this->inscripcion('Primeros pasos con Arduino', 'oriana@eventos.test');

        $this->actingAs($oriana)->get("/inscripciones/{$inscripcion->id}/certificado")->assertForbidden();
        $this->actingAs($oriana)->get("/inscripciones/{$inscripcion->id}/encuesta")->assertForbidden();
    }

    public function test_sin_encuesta_redirige_a_la_encuesta()
    {
        $franco = $this->usuario('franco@eventos.test');
        $inscripcion = $this->inscripcion('Taller de Linux desde cero', 'franco@eventos.test');

        $this->actingAs($franco)->get("/inscripciones/{$inscripcion->id}/certificado")
            ->assertRedirect("/inscripciones/{$inscripcion->id}/encuesta")
            ->assertSessionHas('error', 'Antes de descargar el certificado, respondé la encuesta del evento.');
    }

    public function test_con_encuesta_descarga_el_pdf()
    {
        $alejandro = $this->usuario('alejandro@eventos.test');
        $inscripcion = $this->inscripcion('Taller de Linux desde cero', 'alejandro@eventos.test');

        $respuesta = $this->actingAs($alejandro)->get("/inscripciones/{$inscripcion->id}/certificado");

        $respuesta->assertOk();
        $respuesta->assertHeader('content-type', 'application/pdf');
        $respuesta->assertDownload('certificado-taller-de-linux-desde-cero.pdf');
        $this->assertStringStartsWith('%PDF', $respuesta->getContent());
    }

    public function test_responder_la_encuesta_habilita_el_certificado()
    {
        $franco = $this->usuario('franco@eventos.test');
        $inscripcion = $this->inscripcion('Taller de Linux desde cero', 'franco@eventos.test');

        $this->actingAs($franco)->post("/inscripciones/{$inscripcion->id}/encuesta", ['comentario' => 'Me sirvió mucho.'])
            ->assertSessionHas('success');

        $this->actingAs($franco)->get("/inscripciones/{$inscripcion->id}/certificado")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_un_alumno_no_descarga_el_certificado_de_otro()
    {
        $franco = $this->usuario('franco@eventos.test');
        $deAlejandro = $this->inscripcion('Taller de Linux desde cero', 'alejandro@eventos.test');

        $this->actingAs($franco)->get("/inscripciones/{$deAlejandro->id}/certificado")->assertForbidden();
        $this->actingAs($franco)->get("/inscripciones/{$deAlejandro->id}/encuesta")->assertForbidden();
        $this->get("/inscripciones/{$deAlejandro->id}/certificado")->assertForbidden();
    }

    public function test_un_invitado_descarga_con_url_firmada()
    {
        $inscripcion = $this->invitada();

        $this->post($inscripcion->urlEncuesta(firmada: true), ['comentario' => 'Muy bueno.'])
            ->assertSessionHas('success');
        $this->assertSame('Muy bueno.', $inscripcion->encuesta()->value('comentario'));

        $this->get($inscripcion->urlCertificado(firmada: true))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_el_invitado_sin_encuesta_va_a_la_encuesta_firmada()
    {
        $inscripcion = $this->invitada();

        $respuesta = $this->get($inscripcion->urlCertificado(firmada: true));

        $respuesta->assertRedirect();
        $this->assertTrue(URL::isValidUrl($respuesta->headers->get('Location')));
        $this->get($respuesta->headers->get('Location'))->assertOk();
    }

    public function test_url_firmada_alterada_da_403()
    {
        $inscripcion = $this->invitada();
        $inscripcion->encuesta()->create(['comentario' => 'Muy bueno.']);
        $otra = Inscripcion::whereRelation('evento', 'titulo', 'Primeros pasos con Arduino')
            ->whereRelation('user', 'email', 'alejandro@eventos.test')
            ->firstOrFail();

        $firmada = $inscripcion->urlCertificado(firmada: true);

        $this->get($firmada.'x')->assertForbidden();
        $this->get(str_replace("/inscripciones/{$inscripcion->id}/", "/inscripciones/{$otra->id}/", $firmada))->assertForbidden();
        $this->get("/inscripciones/{$inscripcion->id}/certificado")->assertForbidden();
    }

    public function test_no_se_puede_responder_la_encuesta_dos_veces()
    {
        $alejandro = $this->usuario('alejandro@eventos.test');
        $inscripcion = $this->inscripcion('Taller de Linux desde cero', 'alejandro@eventos.test');

        $this->actingAs($alejandro)->post("/inscripciones/{$inscripcion->id}/encuesta", ['comentario' => 'Cambio de opinión.'])
            ->assertSessionHas('error', 'Ya respondiste la encuesta de este evento.');

        $this->assertSame(1, $inscripcion->encuesta()->count());
        $this->assertSame('Muy práctico, los ejercicios en la terminal ayudaron mucho.', $inscripcion->encuesta()->value('comentario'));
    }

    public function test_la_encuesta_pide_un_comentario()
    {
        $franco = $this->usuario('franco@eventos.test');
        $inscripcion = $this->inscripcion('Taller de Linux desde cero', 'franco@eventos.test');

        $this->actingAs($franco)->post("/inscripciones/{$inscripcion->id}/encuesta", ['comentario' => ''])
            ->assertSessionHasErrors(['comentario' => 'Escribí un comentario.']);
        $this->assertFalse($inscripcion->encuesta()->exists());
    }
}
