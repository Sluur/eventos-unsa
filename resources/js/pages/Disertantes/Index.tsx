import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { Eye, EyeOff, Mic, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDelete from '@/components/confirm-delete';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Disertante {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    eventos_count: number;
    seguidores_count: number;
    activo: boolean;
}

interface Props {
    disertantes: Disertante[];
    estado: 'activos' | 'inactivos' | 'todos';
}

const filtros = [
    { valor: 'activos', titulo: 'Activos' },
    { valor: 'inactivos', titulo: 'Inactivos' },
    { valor: 'todos', titulo: 'Todos' },
];

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Disertantes', href: '/disertantes' }];

export default function Index({ disertantes, estado }: Props) {
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

                <Tabs
                    value={estado}
                    onValueChange={(v) => router.get('/disertantes', { estado: v }, { preserveScroll: true, replace: true })}
                >
                    <TabsList>
                        {filtros.map((f) => (
                            <TabsTrigger key={f.valor} value={f.valor}>
                                {f.titulo}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Card className="py-0">
                    {disertantes.length === 0 ? (
                        <EmptyState
                            icono={Mic}
                            titulo={estado === 'inactivos' ? 'No hay disertantes inactivos' : 'No hay disertantes cargados'}
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Nombre</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead className="hidden md:table-cell">Eventos</TableHead>
                                    <TableHead className="hidden sm:table-cell">Seguidores</TableHead>
                                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disertantes.map((disertante) => (
                                    <TableRow key={disertante.id}>
                                        <TableCell className="pl-6">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={cn('font-medium', !disertante.activo && 'text-muted-foreground')}>
                                                    {disertante.apellido}, {disertante.nombre}
                                                </span>
                                                {!disertante.activo && <Badge variant="outline">Inactivo</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden text-muted-foreground md:table-cell">
                                            {disertante.email}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="secondary" className="tabular-nums">
                                                {disertante.eventos_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden tabular-nums sm:table-cell">{disertante.seguidores_count}</TableCell>
                                        <TableCell className="pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/disertantes/${disertante.id}/edit`}>
                                                        <Pencil />
                                                        <span className="hidden sm:inline">Editar</span>
                                                    </Link>
                                                </Button>
                                                {disertante.eventos_count > 0 ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.patch(`/disertantes/${disertante.id}/activo`, {}, { preserveScroll: true })
                                                        }
                                                    >
                                                        {disertante.activo ? <EyeOff /> : <Eye />}
                                                        <span className="hidden sm:inline">{disertante.activo ? 'Desactivar' : 'Activar'}</span>
                                                    </Button>
                                                ) : (
                                                    <ConfirmDelete
                                                        url={`/disertantes/${disertante.id}`}
                                                        titulo="¿Eliminar el disertante?"
                                                    >
                                                        <Button variant="ghost" size="sm" className="text-destructive">
                                                            <Trash2 />
                                                            <span className="hidden sm:inline">Eliminar</span>
                                                        </Button>
                                                    </ConfirmDelete>
                                                )}
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
