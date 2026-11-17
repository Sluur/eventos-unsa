import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDelete from '@/components/confirm-delete';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
}

interface Props {
    categorias: Categoria[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categorías', href: '/categorias' },
];

export default function Index({ categorias }: Props) {
    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Categorías" />

            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Categorías</h1>
                        <p className="text-sm text-muted-foreground">
                            Tipos de eventos que se pueden publicar.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/categorias/create">
                            <Plus className="size-4" />
                            Nueva categoría
                        </Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nombre</th>
                                <th className="hidden px-4 py-3 font-medium md:table-cell">
                                    Descripción
                                </th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorias.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                        No hay categorías cargadas.
                                    </td>
                                </tr>
                            )}

                            {categorias.map((categoria) => (
                                <tr key={categoria.id} className="border-t hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{categoria.nombre}</td>
                                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                        {categoria.descripcion ?? '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/categorias/${categoria.id}/edit`}>
                                                    <Pencil className="size-4" />
                                                    <span className="hidden sm:inline">Editar</span>
                                                </Link>
                                            </Button>
                                            <ConfirmDelete url={`/categorias/${categoria.id}`} titulo="¿Eliminar la categoría?">
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