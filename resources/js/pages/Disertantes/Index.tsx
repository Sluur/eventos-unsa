import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDelete from '@/components/confirm-delete';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';

interface Disertante {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    eventos_count: number;
}

interface Props {
    disertantes: Disertante[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Disertantes', href: '/disertantes' },
];

export default function Index({ disertantes }: Props) {
    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Disertantes" />

            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Disertantes</h1>
                        <p className="text-sm text-muted-foreground">
                            Personas que dan las charlas y talleres.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/disertantes/create">
                            <Plus className="size-4" />
                            Nuevo disertante
                        </Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nombre</th>
                                <th className="hidden px-4 py-3 font-medium md:table-cell">
                                    Email
                                </th>
                                <th className="hidden px-4 py-3 font-medium md:table-cell">
                                    Eventos
                                </th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disertantes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No hay disertantes cargados.
                                    </td>
                                </tr>
                            )}

                            {disertantes.map((disertante) => (
                                <tr key={disertante.id} className="border-t hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">
                                        {disertante.apellido}, {disertante.nombre}
                                    </td>
                                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                        {disertante.email}
                                    </td>
                                    <td className="hidden px-4 py-3 md:table-cell">
                                        {disertante.eventos_count}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/disertantes/${disertante.id}/edit`}>
                                                    <Pencil className="size-4" />
                                                    <span className="hidden sm:inline">Editar</span>
                                                </Link>
                                            </Button>
                                            <ConfirmDelete url={`/disertantes/${disertante.id}`} titulo="¿Eliminar el disertante?">
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="size-4" />
                                                    <span className="hidden sm:inline">Eliminar</span>
                                                </Button>
                                            </ConfirmDelete>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
