import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FormField from '@/components/form-field';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lugares', href: '/lugares' },
    { title: 'Nuevo', href: '/lugares/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        direccion: '',
        capacidad: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/lugares');
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Nuevo lugar" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Nuevo lugar" />

                <Card>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <FormField label="Nombre" htmlFor="nombre" error={errors.nombre}>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    aria-invalid={!!errors.nombre}
                                />
                            </FormField>

                            <FormField label="Dirección" htmlFor="direccion" error={errors.direccion}>
                                <Input
                                    id="direccion"
                                    value={data.direccion}
                                    onChange={(e) => setData('direccion', e.target.value)}
                                    aria-invalid={!!errors.direccion}
                                />
                            </FormField>

                            <FormField label="Capacidad" htmlFor="capacidad" error={errors.capacidad}>
                                <Input
                                    id="capacidad"
                                    type="number"
                                    min={1}
                                    value={data.capacidad}
                                    onChange={(e) => setData('capacidad', e.target.value)}
                                    aria-invalid={!!errors.capacidad}
                                />
                            </FormField>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/lugares">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
