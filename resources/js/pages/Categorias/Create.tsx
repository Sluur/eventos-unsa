import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import CategoriaForm, { type CategoriaFormData } from '@/components/categoria-form';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categorías', href: '/categorias' },
    { title: 'Nueva', href: '/categorias/create' },
];

export default function Create() {
    const form = useForm<CategoriaFormData>({
        nombre: '',
        descripcion: '',
        requiere_aprobacion: false,
        requiere_documentacion: false,
        documentacion_descripcion: '',
        color: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/categorias');
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Nueva categoría" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Nueva categoría" />

                <Card>
                    <CardContent>
                        <CategoriaForm
                            form={form}
                            onSubmit={submit}
                            acciones={
                                <>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Guardando...' : 'Guardar'}
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
