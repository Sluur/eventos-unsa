import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FormField from '@/components/form-field';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
}

interface Props {
    categoria: Categoria;
}

export default function Edit({ categoria }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categorías', href: '/categorias' },
        { title: 'Editar', href: `/categorias/${categoria.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/categorias/${categoria.id}`);
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Editar categoría" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Editar categoría" descripcion={categoria.nombre} />

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
                                    {processing ? 'Guardando...' : 'Actualizar'}
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
