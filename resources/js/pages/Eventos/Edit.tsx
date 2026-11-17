import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { DisertanteOpcion } from '@/components/disertantes-select';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import EventoForm, { type EventoFormData, type LugarOpcion } from '@/components/evento-form';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

interface Evento {
    id: number;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    lugar_id: number;
    cupo: number;
    estado: EstadoEvento;
    inscriptos_count: number;
    disertantes: { id: number }[];
}

interface Props {
    evento: Evento;
    lugares: LugarOpcion[];
    disertantes: DisertanteOpcion[];
}

// "2026-11-24T18:00:00.000000Z" -> "2026-11-24T18:00" para el input datetime-local
const paraInput = (fecha: string) => fecha.slice(0, 16);

export default function Edit({ evento, lugares, disertantes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Eventos', href: '/eventos' },
        { title: evento.titulo, href: `/eventos/${evento.id}` },
        { title: 'Editar', href: `/eventos/${evento.id}/edit` },
    ];

    const form = useForm<EventoFormData>({
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fecha_inicio: paraInput(evento.fecha_inicio),
        fecha_fin: paraInput(evento.fecha_fin),
        lugar_id: String(evento.lugar_id),
        cupo: String(evento.cupo),
        disertantes: evento.disertantes.map((d) => d.id),
        estado: evento.estado,
    });

    const guardar = (estado: 'borrador' | 'publicado') => (e: FormEvent) => {
        e.preventDefault();
        form.transform((datos) => ({ ...datos, estado }));
        form.put(`/eventos/${evento.id}`);
    };

    const esBorrador = evento.estado === 'borrador';

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title={`Editar - ${evento.titulo}`} />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Editar evento" descripcion={evento.titulo}>
                    <EstadoBadge estado={evento.estado} />
                </PageHeader>

                <Card>
                    <CardContent>
                        <EventoForm
                            form={form}
                            lugares={lugares}
                            disertantes={disertantes}
                            onSubmit={guardar(esBorrador ? 'borrador' : 'publicado')}
                            ayudaCupo={
                                evento.inscriptos_count > 0
                                    ? `Ya hay ${evento.inscriptos_count} inscriptos, no puede ser menor.`
                                    : undefined
                            }
                            acciones={
                                <>
                                    {esBorrador ? (
                                        <>
                                            <Button type="button" disabled={form.processing} onClick={guardar('publicado')}>
                                                Publicar
                                            </Button>
                                            <Button type="submit" variant="secondary" disabled={form.processing}>
                                                Guardar borrador
                                            </Button>
                                        </>
                                    ) : (
                                        <Button type="submit" disabled={form.processing}>
                                            {form.processing ? 'Guardando...' : 'Guardar cambios'}
                                        </Button>
                                    )}
                                    <Button variant="ghost" asChild>
                                        <Link href={`/eventos/${evento.id}`}>Cancelar</Link>
                                    </Button>
                                </>
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
