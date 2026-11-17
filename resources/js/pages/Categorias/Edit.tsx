import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import CategoriaForm, { type CategoriaFormData } from '@/components/categoria-form';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
    requiere_aprobacion: boolean;
    requiere_documentacion: boolean;
    documentacion_descripcion: string | null;
    color: string | null;
}

interface Props {
    categoria: Categoria;
}

export default function Edit({ categoria }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categorías', href: '/categorias' },
        { title: 'Editar', href: `/categorias/${categoria.id}/edit` },
    ];

    const form = useForm<CategoriaFormData>({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion ?? '',
        requiere_aprobacion: categoria.requiere_aprobacion,
        requiere_documentacion: categoria.requiere_documentacion,
        documentacion_descripcion: categoria.documentacion_descripcion ?? '',
        color: categoria.color ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.put(`/categorias/${categoria.id}`);
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Editar categoría" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Editar categoría" descripcion={categoria.nombre} />

                <Card>
                    <CardContent>
                        <CategoriaForm
                            form={form}
                            onSubmit={submit}
                            acciones={
                                <>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Guardando...' : 'Actualizar'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/categorias">Cancelar</Link>
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
