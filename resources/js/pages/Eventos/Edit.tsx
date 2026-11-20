import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { DisertanteOpcion } from '@/components/disertantes-select';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import EventoForm, { type CategoriaOpcion, type EventoFormData, type LugarOpcion } from '@/components/evento-form';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

interface Evento {
    id: number;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    inscripcion_hasta: string | null;
    categoria_id: number;
    lugar_id: number;
    cupo: number;
    solo_registrados: boolean;
    estado: EstadoEvento;
    imagen_url: string | null;
    inscriptos_count: number;
    disertantes: { id: number }[];
}

interface Props {
    evento: Evento;
    categorias: CategoriaOpcion[];
    lugares: LugarOpcion[];
    disertantes: DisertanteOpcion[];
}

const paraInput = (fecha: string) => fecha.slice(0, 16);

export default function Edit({ evento, categorias, lugares, disertantes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Eventos', href: '/eventos' },
        { title: evento.titulo, href: `/eventos/${evento.id}` },
        { title: 'Editar', href: `/eventos/${evento.id}/edit` },
    ];

    const form = useForm<EventoFormData>({
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fecha_inicio: paraInput(evento.fecha_inicio),
        inscripcion_hasta: evento.inscripcion_hasta ? paraInput(evento.inscripcion_hasta) : '',
        categoria_id: String(evento.categoria_id),
        lugar_id: String(evento.lugar_id),
        cupo: String(evento.cupo),
        solo_registrados: evento.solo_registrados,
        disertantes: evento.disertantes.map((d) => d.id),
        estado: evento.estado,
        imagen: null,
        quitar_imagen: false,
    });

    const guardar = (estado: 'borrador' | 'publicado') => (e: FormEvent) => {
        e.preventDefault();
        // con archivo hay que mandar post con _method put
        form.transform((datos) => ({ ...datos, estado, _method: 'put' }));
        form.post(`/eventos/${evento.id}`, { forceFormData: true });
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
                            categorias={categorias}
                            lugares={lugares}
                            disertantes={disertantes}
                            onSubmit={guardar(esBorrador ? 'borrador' : 'publicado')}
                            imagenActual={evento.imagen_url}
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
