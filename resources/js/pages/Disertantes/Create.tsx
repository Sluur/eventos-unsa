import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Disertantes', href: '/disertantes' },
    { title: 'Nuevo', href: '/disertantes/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        apellido: '',
        email: '',
        biografia: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/disertantes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo disertante" />

            <div className="p-4 md:p-6">
                <div className="max-w-xl rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-semibold">Nuevo disertante</h1>

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
                            <Label htmlFor="apellido">Apellido</Label>
                            <Input
                                id="apellido"
                                value={data.apellido}
                                onChange={(e) => setData('apellido', e.target.value)}
                            />
                            {errors.apellido && (
                                <p className="text-sm text-red-600">{errors.apellido}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="biografia">Biografía</Label>
                            <textarea
                                id="biografia"
                                rows={4}
                                value={data.biografia}
                                onChange={(e) => setData('biografia', e.target.value)}
                                className="rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            />
                            {errors.biografia && (
                                <p className="text-sm text-red-600">{errors.biografia}</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/disertantes">Cancelar</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
