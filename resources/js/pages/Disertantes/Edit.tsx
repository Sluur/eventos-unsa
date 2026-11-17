import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FormField from '@/components/form-field';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

interface Disertante {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    biografia: string | null;
}

interface Props {
    disertante: Disertante;
}

export default function Edit({ disertante }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Disertantes', href: '/disertantes' },
        { title: 'Editar', href: `/disertantes/${disertante.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: disertante.nombre,
        apellido: disertante.apellido,
        email: disertante.email,
        biografia: disertante.biografia ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/disertantes/${disertante.id}`);
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Editar disertante" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader
                    titulo="Editar disertante"
                    descripcion={`${disertante.nombre} ${disertante.apellido}`}
                />

                <Card>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="Nombre" htmlFor="nombre" error={errors.nombre}>
                                    <Input
                                        id="nombre"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        aria-invalid={!!errors.nombre}
                                    />
                                </FormField>

                                <FormField label="Apellido" htmlFor="apellido" error={errors.apellido}>
                                    <Input
                                        id="apellido"
                                        value={data.apellido}
                                        onChange={(e) => setData('apellido', e.target.value)}
                                        aria-invalid={!!errors.apellido}
                                    />
                                </FormField>
                            </div>

                            <FormField label="Email" htmlFor="email" error={errors.email}>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    aria-invalid={!!errors.email}
                                />
                            </FormField>

                            <FormField label="Biografía" htmlFor="biografia" error={errors.biografia}>
                                <Textarea
                                    id="biografia"
                                    rows={4}
                                    value={data.biografia}
                                    onChange={(e) => setData('biografia', e.target.value)}
                                    aria-invalid={!!errors.biografia}
                                />
                            </FormField>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Actualizar'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/disertantes">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
