import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import CategoriaReglas from '@/components/categoria-reglas';
import ConfirmDelete from '@/components/confirm-delete';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    categorias: Categoria[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Categorías', href: '/categorias' }];

export default function Index({ categorias }: Props) {
    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Categorías" />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Categorías" descripcion="Tipos de eventos que se pueden publicar.">
                    <Button asChild>
                        <Link href="/categorias/create">
                            <Plus />
                            Nueva categoría
                        </Link>
                    </Button>
                </PageHeader>

                <Card className="py-0">
                    {categorias.length === 0 ? (
                        <EmptyState icono={Tags} titulo="No hay categorías cargadas" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Nombre</TableHead>
                                    <TableHead className="hidden md:table-cell">Descripción</TableHead>
                                    <TableHead className="hidden sm:table-cell">Inscripción</TableHead>
                                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categorias.map((categoria) => (
                                    <TableRow key={categoria.id}>
                                        <TableCell className="pl-6 font-medium">
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="size-3 shrink-0 rounded-full border"
                                                    style={{ backgroundColor: categoria.color ?? 'transparent' }}
                                                />
                                                {categoria.nombre}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden max-w-md truncate text-muted-foreground md:table-cell">
                                            {categoria.descripcion ?? '-'}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <CategoriaReglas categoria={categoria} />
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/categorias/${categoria.id}/edit`}>
                                                        <Pencil />
                                                        <span className="hidden sm:inline">Editar</span>
                                                    </Link>
                                                </Button>
                                                <ConfirmDelete
                                                    url={`/categorias/${categoria.id}`}
                                                    titulo="¿Eliminar la categoría?"
                                                >
                                                    <Button variant="ghost" size="sm" className="text-destructive">
                                                        <Trash2 />
                                                        <span className="hidden sm:inline">Eliminar</span>
                                                    </Button>
                                                </ConfirmDelete>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>
        </>
    );
}
