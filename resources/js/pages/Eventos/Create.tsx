import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { DisertanteOpcion } from '@/components/disertantes-select';
import EventoForm, { type CategoriaOpcion, type EventoFormData, type LugarOpcion } from '@/components/evento-form';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

interface Copia {
    titulo: string;
    categoria_id: string;
    descripcion: string;
    lugar_id: string;
    cupo: string;
    solo_registrados: boolean;
    disertantes: number[];
    original: string;
}

interface Props {
    categorias: CategoriaOpcion[];
    lugares: LugarOpcion[];
    disertantes: DisertanteOpcion[];
    copia: Copia | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Eventos', href: '/eventos' },
    { title: 'Nuevo evento', href: '/eventos/create' },
];

export default function Create({ categorias, lugares, disertantes, copia }: Props) {
    const form = useForm<EventoFormData>({
        titulo: copia?.titulo ?? '',
        descripcion: copia?.descripcion ?? '',
        fecha_inicio: '',
        fecha_fin: '',
        categoria_id: copia?.categoria_id ?? '',
        lugar_id: copia?.lugar_id ?? '',
        cupo: copia?.cupo ?? '',
        solo_registrados: copia?.solo_registrados ?? true,
        disertantes: copia?.disertantes ?? [],
        estado: 'borrador',
        imagen: null,
        quitar_imagen: false,
    });

    const guardar = (estado: 'borrador' | 'publicado') => (e: FormEvent) => {
        e.preventDefault();
        form.transform((datos) => ({ ...datos, estado }));
        form.post('/eventos', { forceFormData: true });
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Nuevo evento" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader
                    titulo="Nuevo evento"
                    descripcion={
                        copia
                            ? `Copia de "${copia.original}". Elegí las fechas nuevas.`
                            : 'Podés guardarlo como borrador y publicarlo más adelante.'
                    }
                />

                <Card>
                    <CardContent>
                        <EventoForm
                            form={form}
                            categorias={categorias}
                            lugares={lugares}
                            disertantes={disertantes}
                            onSubmit={guardar('publicado')}
                            acciones={
                                <>
                                    <Button type="submit" disabled={form.processing}>
                                        Publicar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={form.processing}
                                        onClick={guardar('borrador')}
                                    >
                                        Guardar borrador
                                    </Button>
                                    <Button variant="ghost" asChild>
                                        <Link href="/eventos">Cancelar</Link>
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
