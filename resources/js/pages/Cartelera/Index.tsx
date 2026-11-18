import { Head, Link } from '@inertiajs/react';
import { Award, CalendarX, MousePointerClick, UserCheck } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import EventoTarjeta, { type EventoTarjetaData } from '@/components/evento-tarjeta';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
    eventos: EventoTarjetaData[];
}

const pasos = [
    {
        icono: MousePointerClick,
        titulo: 'Elegí un evento',
        texto: 'Mirá las charlas, talleres y cursos que se vienen en la facultad.',
    },
    {
        icono: UserCheck,
        titulo: 'Inscribite',
        texto: 'Con tu cuenta o, si el evento es abierto, con tus datos. Te llega un mail de confirmación.',
    },
    {
        icono: Award,
        titulo: 'Recibí tu certificado',
        texto: 'Después del evento descargás el certificado de asistencia en PDF.',
    },
];

export default function Index({ eventos }: Props) {
    return (
        <>
            <Head title="Inicio" />

            <section className="flex flex-col items-start gap-4 border-b px-4 py-12 md:py-16">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                    Charlas, talleres y cursos de la Facultad de Ciencias Exactas
                </h1>
                <p className="max-w-xl text-muted-foreground">
                    Encontrá los eventos de la facultad, inscribite en pocos pasos y descargá tu certificado de asistencia.
                </p>
                <Button asChild size="lg" className="mt-2">
                    <Link href="/login">Ver todos los eventos</Link>
                </Button>
            </section>

            <section className="flex flex-col gap-4 px-4 py-10">
                <h2 className="text-xl font-semibold">Próximos eventos</h2>

                {eventos.length === 0 ? (
                    <Card>
                        <EmptyState
                            icono={CalendarX}
                            titulo="No hay eventos próximos"
                            descripcion="Volvé a mirar en unos días."
                        />
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {eventos.map((evento) => (
                            <EventoTarjeta
                                key={evento.id}
                                evento={evento}
                                href={`/cartelera/${evento.id}`}
                                mostrarEstado={false}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-4 border-t px-4 py-10">
                <h2 className="text-xl font-semibold">Cómo funciona</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    {pasos.map((paso, i) => (
                        <Card key={paso.titulo} className="gap-2 px-5 py-5">
                            <div className="flex items-center gap-2">
                                <paso.icono className="size-5 text-primary" />
                                <span className="font-semibold">
                                    {i + 1}. {paso.titulo}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{paso.texto}</p>
                        </Card>
                    ))}
                </div>
            </section>
        </>
    );
}
