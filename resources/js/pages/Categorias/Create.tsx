import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FormField from '@/components/form-field';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categorías', href: '/categorias' },
    { title: 'Nueva', href: '/categorias/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        descripcion: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/categorias');
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Nueva categoría" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Nueva categoría" />

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

                            <FormField label="Descripción" htmlFor="descripcion" error={errors.descripcion}>
                                <Textarea
                                    id="descripcion"
                                    rows={4}
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    aria-invalid={!!errors.descripcion}
                                />
                            </FormField>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/categorias">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
