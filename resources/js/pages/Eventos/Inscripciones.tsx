import { Head, router, setLayoutProps } from '@inertiajs/react';
import { Check, FileText, Inbox } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import type { EstadoInscripcion } from '@/components/estado-inscripcion-badge';
import PageHeader from '@/components/page-header';
import RechazarInscripcionDialog from '@/components/rechazar-inscripcion-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatearFecha } from '@/lib/fechas';
import type { BreadcrumbItem } from '@/types';

interface Inscripcion {
    id: number;
    estado: EstadoInscripcion;
    archivo: string | null;
    motivo_rechazo: string | null;
    created_at: string;
    revisado_at: string | null;
    user: { id: number; name: string; email: string };
    revisor: { id: number; name: string } | null;
}

interface Props {
    evento: { id: number; titulo: string; cupo: number; estado: string };
    inscripciones: Inscripcion[];
    requiereDocumentacion: boolean;
}

const pestanias: { estado: EstadoInscripcion; titulo: string; vacio: string }[] = [
    { estado: 'pendiente', titulo: 'Pendientes', vacio: 'No hay inscripciones para revisar' },
    { estado: 'confirmada', titulo: 'Confirmadas', vacio: 'No hay inscripciones confirmadas' },
    { estado: 'rechazada', titulo: 'Rechazadas', vacio: 'No hay inscripciones rechazadas' },
    { estado: 'cancelada', titulo: 'Canceladas', vacio: 'No hay inscripciones canceladas' },
];

export default function Inscripciones({ evento, inscripciones, requiereDocumentacion }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Eventos', href: '/eventos' },
        { title: evento.titulo, href: `/eventos/${evento.id}` },
        { title: 'Inscripciones', href: `/eventos/${evento.id}/inscripciones` },
    ];

    const de = (estado: EstadoInscripcion) => inscripciones.filter((i) => i.estado === estado);
    const ocupados = de('pendiente').length + de('confirmada').length;

    const aceptar = (id: number) => {
        router.patch(`/inscripciones/${id}/aceptar`, {}, { preserveScroll: true });
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title={`Inscripciones - ${evento.titulo}`} />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader
                    titulo="Revisar inscripciones"
                    descripcion={`${evento.titulo} · ${ocupados} de ${evento.cupo} lugares ocupados (las pendientes reservan lugar)`}
                />

                <Tabs defaultValue={de('pendiente').length > 0 ? 'pendiente' : 'confirmada'}>
                    <TabsList className="h-auto flex-wrap">
                        {pestanias.map((p) => (
                            <TabsTrigger key={p.estado} value={p.estado} className="gap-1.5">
                                {p.titulo}
                                <Badge variant="secondary" className="rounded-full px-1.5">
                                    {de(p.estado).length}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {pestanias.map((p) => (
                        <TabsContent key={p.estado} value={p.estado}>
                            <Card className="py-0">
                                {de(p.estado).length === 0 ? (
                                    <EmptyState icono={Inbox} titulo={p.vacio} />
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="pl-6">Nombre</TableHead>
                                                <TableHead className="hidden md:table-cell">Inscripción</TableHead>
                                                {requiereDocumentacion && <TableHead>Documento</TableHead>}
                                                {p.estado === 'rechazada' && <TableHead>Motivo</TableHead>}
                                                {p.estado !== 'pendiente' && p.estado !== 'cancelada' && (
                                                    <TableHead className="hidden lg:table-cell">Revisó</TableHead>
                                                )}
                                                {p.estado === 'pendiente' && (
                                                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {de(p.estado).map((i) => (
                                                <TableRow key={i.id}>
                                                    <TableCell className="pl-6">
                                                        <div className="font-medium">{i.user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{i.user.email}</div>
                                                    </TableCell>
                                                    <TableCell className="hidden text-muted-foreground md:table-cell">
                                                        {formatearFecha(i.created_at)}
                                                    </TableCell>
                                                    {requiereDocumentacion && (
                                                        <TableCell>
                                                            {i.archivo ? (
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <a href={`/inscripciones/${i.id}/archivo`} target="_blank" rel="noreferrer">
                                                                        <FileText />
                                                                        Ver
                                                                    </a>
                                                                </Button>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {p.estado === 'rechazada' && (
                                                        <TableCell className="max-w-xs text-muted-foreground">
                                                            {i.motivo_rechazo}
                                                        </TableCell>
                                                    )}
                                                    {p.estado !== 'pendiente' && p.estado !== 'cancelada' && (
                                                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                                                            {i.revisor ? i.revisor.name : 'Automática'}
                                                        </TableCell>
                                                    )}
                                                    {p.estado === 'pendiente' && (
                                                        <TableCell className="pr-6">
                                                            <div className="flex justify-end gap-1">
                                                                <Button size="sm" onClick={() => aceptar(i.id)}>
                                                                    <Check />
                                                                    Aceptar
                                                                </Button>
                                                                <RechazarInscripcionDialog inscripcionId={i.id} nombre={i.user.name} />
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </>
    );
}
