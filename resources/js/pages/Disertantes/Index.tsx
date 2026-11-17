import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Mic, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDelete from '@/components/confirm-delete';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Disertantes', href: '/disertantes' }];

export default function Index({ disertantes }: Props) {
    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Disertantes" />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Disertantes" descripcion="Personas que dan las charlas y talleres.">
                    <Button asChild>
                        <Link href="/disertantes/create">
                            <Plus />
                            Nuevo disertante
                        </Link>
                    </Button>
                </PageHeader>

                <Card className="py-0">
                    {disertantes.length === 0 ? (
                        <EmptyState icono={Mic} titulo="No hay disertantes cargados" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Nombre</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead className="hidden md:table-cell">Eventos</TableHead>
                                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disertantes.map((disertante) => (
                                    <TableRow key={disertante.id}>
                                        <TableCell className="pl-6 font-medium">
                                            {disertante.apellido}, {disertante.nombre}
                                        </TableCell>
                                        <TableCell className="hidden text-muted-foreground md:table-cell">
                                            {disertante.email}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="secondary" className="rounded-full">
                                                {disertante.eventos_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/disertantes/${disertante.id}/edit`}>
                                                        <Pencil />
                                                        <span className="hidden sm:inline">Editar</span>
                                                    </Link>
                                                </Button>
                                                <ConfirmDelete
                                                    url={`/disertantes/${disertante.id}`}
                                                    titulo="¿Eliminar el disertante?"
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
