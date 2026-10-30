import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar categoría" />

            <div className="p-4 md:p-6">
                <div className="max-w-xl rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-semibold">Editar categoría</h1>

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                            />
                            {errors.nombre && (
                                <p className="text-sm text-red-600">{errors.nombre}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <textarea
                                id="descripcion"
                                rows={4}
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                className="rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            />
                            {errors.descripcion && (
                                <p className="text-sm text-red-600">{errors.descripcion}</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Actualizar'}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/categorias">Cancelar</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}