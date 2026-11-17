import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { DisertanteOpcion } from '@/components/disertantes-select';
import EventoForm, { type EventoFormData, type LugarOpcion } from '@/components/evento-form';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

interface Props {
    lugares: LugarOpcion[];
    disertantes: DisertanteOpcion[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Eventos', href: '/eventos' },
    { title: 'Nueva charla', href: '/eventos/create' },
];

export default function Create({ lugares, disertantes }: Props) {
    const form = useForm<EventoFormData>({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        lugar_id: '',
        cupo: '',
        disertantes: [],
        estado: 'borrador',
    });

    const guardar = (estado: 'borrador' | 'publicado') => (e: FormEvent) => {
        e.preventDefault();
        form.transform((datos) => ({ ...datos, estado }));
        form.post('/eventos');
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Nueva charla" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader
                    titulo="Nueva charla"
                    descripcion="Podés guardarla como borrador y publicarla más adelante."
                />

                <Card>
                    <CardContent>
                        <EventoForm
                            form={form}
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
