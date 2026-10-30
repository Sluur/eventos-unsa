import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo lugar" />

            <div className="p-4 md:p-6">
                <div className="max-w-xl rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-semibold">Nuevo lugar</h1>

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
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input
                                id="direccion"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                            />
                            {errors.direccion && (
                                <p className="text-sm text-red-600">{errors.direccion}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="capacidad">Capacidad</Label>
                            <Input
                                id="capacidad"
                                type="number"
                                min={1}
                                value={data.capacidad}
                                onChange={(e) => setData('capacidad', e.target.value)}
                            />
                            {errors.capacidad && (
                                <p className="text-sm text-red-600">{errors.capacidad}</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/lugares">Cancelar</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
