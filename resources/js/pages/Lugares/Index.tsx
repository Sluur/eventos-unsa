import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Lugar {
    id: number;
    nombre: string;
    direccion: string | null;
    capacidad: number;
}

interface Props {
    lugares: Lugar[];
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lugares', href: '/lugares' },
];

export default function Index({ lugares, flash }: Props) {
    const eliminar = (id: number) => {
        if (confirm('¿Seguro que querés eliminar este lugar?')) {
            router.delete(`/lugares/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lugares" />

            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Lugares</h1>
                        <p className="text-sm text-muted-foreground">
                            Aulas y salones donde se hacen los eventos.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/lugares/create">
                            <Plus className="size-4" />
                            Nuevo lugar
                        </Link>
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nombre</th>
                                <th className="hidden px-4 py-3 font-medium md:table-cell">
                                    Dirección
                                </th>
                                <th className="px-4 py-3 font-medium">Capacidad</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lugares.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No hay lugares cargados.
                                    </td>
                                </tr>
                            )}

                            {lugares.map((lugar) => (
                                <tr key={lugar.id} className="border-t hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{lugar.nombre}</td>
                                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                        {lugar.direccion ?? '-'}
                                    </td>
                                    <td className="px-4 py-3">{lugar.capacidad}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/lugares/${lugar.id}/edit`}>
                                                    <Pencil className="size-4" />
                                                    <span className="hidden sm:inline">Editar</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => eliminar(lugar.id)}
                                            >
                                                <Trash2 className="size-4" />
                                                <span className="hidden sm:inline">Eliminar</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
