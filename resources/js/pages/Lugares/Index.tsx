import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDelete from '@/components/confirm-delete';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

interface Lugar {
    id: number;
    nombre: string;
    direccion: string | null;
    capacidad: number;
}

interface Props {
    lugares: Lugar[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Lugares', href: '/lugares' }];

export default function Index({ lugares }: Props) {
    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Lugares" />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Lugares" descripcion="Aulas y salones donde se hacen los eventos.">
                    <Button asChild>
                        <Link href="/lugares/create">
                            <Plus />
                            Nuevo lugar
                        </Link>
                    </Button>
                </PageHeader>

                <Card className="py-0">
                    {lugares.length === 0 ? (
                        <EmptyState icono={MapPin} titulo="No hay lugares cargados" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Nombre</TableHead>
                                    <TableHead className="hidden md:table-cell">Dirección</TableHead>
                                    <TableHead>Capacidad</TableHead>
                                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lugares.map((lugar) => (
                                    <TableRow key={lugar.id}>
                                        <TableCell className="pl-6 font-medium">{lugar.nombre}</TableCell>
                                        <TableCell className="hidden text-muted-foreground md:table-cell">
                                            {lugar.direccion ?? '-'}
                                        </TableCell>
                                        <TableCell>{lugar.capacidad}</TableCell>
                                        <TableCell className="pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/lugares/${lugar.id}/edit`}>
                                                        <Pencil />
                                                        <span className="hidden sm:inline">Editar</span>
                                                    </Link>
                                                </Button>
                                                <ConfirmDelete url={`/lugares/${lugar.id}`} titulo="¿Eliminar el lugar?">
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
