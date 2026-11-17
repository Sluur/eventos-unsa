import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { ArrowLeft, Ban, CalendarDays, CircleCheck, ClipboardCheck, MapPin, Mic, Pencil, Trash2, User, Users } from 'lucide-react';
import CancelarEventoDialog from '@/components/cancelar-evento-dialog';
import ConfirmDelete from '@/components/confirm-delete';
import CupoBar from '@/components/cupo-bar';
import EmptyState from '@/components/empty-state';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import FechaBloque from '@/components/fecha-bloque';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatearFechaLarga, formatearHora } from '@/lib/fechas';
import type { BreadcrumbItem } from '@/types';

interface Disertante {
    id: number;
    nombre: string;
    apellido: string;
    biografia: string | null;
}

interface Evento {
    id: number;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    cupo: number;
    estado: EstadoEvento;
    motivo_cancelacion: string | null;
    inscriptos_count: number;
    categoria: { id: number; nombre: string };
    lugar: { id: number; nombre: string; direccion: string | null };
    organizador: { id: number; name: string };
    disertantes: Disertante[];
}

interface Inscripto {
    id: number;
    asistio: boolean;
    created_at: string;
    user: { id: number; name: string; email: string };
}

interface Props {
    evento: Evento;
    puedeGestionar: boolean;
    inscriptos: Inscripto[];
    puedeInscribirse: boolean;
    estaInscripto: boolean;
    motivoSinInscripcion: string | null;
    yaPaso: boolean;
}

export default function Show({
    evento,
    puedeGestionar,
    inscriptos,
    puedeInscribirse,
    estaInscripto,
    motivoSinInscripcion,
    yaPaso,
}: Props) {
    const permisos = (usePage().props as { permisos?: string[] }).permisos ?? [];
    const puedeTomarAsistencia =
        puedeGestionar &&
        permisos.includes('tomar asistencia') &&
        ['publicado', 'finalizado'].includes(evento.estado);
    const sePuedeEditar = !['finalizado', 'cancelado'].includes(evento.estado);
    const puedeEditar = puedeGestionar && permisos.includes('editar eventos') && sePuedeEditar;
    const puedeEliminar = puedeGestionar && permisos.includes('eliminar eventos');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Eventos', href: '/eventos' },
        { title: evento.titulo, href: `/eventos/${evento.id}` },
    ];

    const lugaresLibres = Math.max(0, evento.cupo - evento.inscriptos_count);

    const inscribirme = () => {
        router.post(`/eventos/${evento.id}/inscripcion`, {}, { preserveScroll: true });
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title={evento.titulo} />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <Link
                    href="/eventos"
                    className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Volver al listado
                </Link>

                {/* Encabezado */}
                <div className="flex items-start gap-4 sm:gap-6">
                    <FechaBloque fecha={evento.fecha_inicio} grande />
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">{evento.categoria.nombre}</span>
                            <EstadoBadge estado={evento.estado} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{evento.titulo}</h1>
                    </div>
                </div>

                {(puedeEditar || puedeEliminar) && (
                    <div className="flex flex-wrap gap-2">
                        {puedeEditar && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/eventos/${evento.id}/edit`}>
                                    <Pencil />
                                    Editar
                                </Link>
                            </Button>
                        )}
                        {puedeEditar && (
                            <CancelarEventoDialog eventoId={evento.id} inscriptos={evento.inscriptos_count} />
                        )}
                        {puedeEliminar && (
                            <ConfirmDelete
                                url={`/eventos/${evento.id}`}
                                titulo="¿Eliminar el evento?"
                                descripcion="Solo se pueden eliminar eventos sin inscripciones. Si ya tiene inscriptos, cancelalo."
                            >
                                <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 />
                                    Eliminar
                                </Button>
                            </ConfirmDelete>
                        )}
                    </div>
                )}

                {evento.estado === 'cancelado' && (
                    <Alert variant="destructive">
                        <Ban />
                        <AlertTitle>Este evento fue cancelado</AlertTitle>
                        {evento.motivo_cancelacion && (
                            <AlertDescription>{evento.motivo_cancelacion}</AlertDescription>
                        )}
                    </Alert>
                )}

                {/* Barra de cupo y acciones */}
                <Card className="py-4">
                    <CardContent className="flex flex-col gap-4 px-5 sm:flex-row sm:items-center">
                        <div className="flex flex-1 flex-col gap-2">
                            <div className="flex items-baseline justify-between text-sm">
                                <span className="font-medium">
                                    {lugaresLibres === 0
                                        ? 'No quedan lugares'
                                        : `Quedan ${lugaresLibres} ${lugaresLibres === 1 ? 'lugar' : 'lugares'}`}
                                </span>
                                <span className="text-muted-foreground">
                                    {evento.inscriptos_count} / {evento.cupo}
                                </span>
                            </div>
                            <CupoBar inscriptos={evento.inscriptos_count} cupo={evento.cupo} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            {puedeInscribirse && estaInscripto && (
                                <>
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                                        <CircleCheck className="size-4" />
                                        Estás inscripto
                                    </span>
                                    {!yaPaso && evento.estado !== 'cancelado' && (
                                        <ConfirmDelete
                                            url={`/eventos/${evento.id}/inscripcion`}
                                            titulo="¿Cancelar tu inscripción?"
                                            descripcion="Vas a liberar tu lugar y otra persona lo puede ocupar."
                                            textoBoton="Cancelar inscripción"
                                            textoCancelar="Volver"
                                        >
                                            <Button variant="outline">Cancelar inscripción</Button>
                                        </ConfirmDelete>
                                    )}
                                </>
                            )}

                            {puedeInscribirse && !estaInscripto && (
                                <div className="flex flex-col items-stretch gap-1 sm:items-end">
                                    <Button onClick={inscribirme} disabled={motivoSinInscripcion !== null}>
                                        Inscribirme
                                    </Button>
                                    {motivoSinInscripcion && (
                                        <p className="text-sm text-muted-foreground">{motivoSinInscripcion}</p>
                                    )}
                                </div>
                            )}

                            {puedeTomarAsistencia && (
                                <Button variant="outline" asChild>
                                    <Link href={`/eventos/${evento.id}/asistencia`}>
                                        <ClipboardCheck />
                                        Tomar asistencia
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Sobre el evento</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6">
                            <p className="whitespace-pre-line text-muted-foreground">{evento.descripcion}</p>

                            <div className="grid gap-4 text-sm sm:grid-cols-3">
                                <Dato icono={CalendarDays} titulo="Cuándo">
                                    <span className="capitalize">{formatearFechaLarga(evento.fecha_inicio)}</span>
                                    <span className="text-muted-foreground">
                                        Hasta las {formatearHora(evento.fecha_fin)}
                                    </span>
                                </Dato>
                                <Dato icono={MapPin} titulo="Dónde">
                                    <span>{evento.lugar.nombre}</span>
                                    {evento.lugar.direccion && (
                                        <span className="text-muted-foreground">{evento.lugar.direccion}</span>
                                    )}
                                </Dato>
                                <Dato icono={User} titulo="Organiza">
                                    <span>{evento.organizador.name}</span>
                                </Dato>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Disertantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {evento.disertantes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin disertantes cargados.</p>
                            ) : (
                                <ul className="flex flex-col gap-4">
                                    {evento.disertantes.map((d) => (
                                        <li key={d.id} className="flex items-start gap-3 text-sm">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <Mic className="size-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {d.nombre} {d.apellido}
                                                </div>
                                                {d.biografia && (
                                                    <div className="text-muted-foreground">{d.biografia}</div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {puedeGestionar && (
                    <Card className="gap-0 pb-0">
                        <CardHeader className="pb-4">
                            <CardTitle>Inscriptos ({inscriptos.length})</CardTitle>
                        </CardHeader>
                        {inscriptos.length === 0 ? (
                            <EmptyState icono={Users} titulo="Todavía no hay inscriptos" />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 pl-6">#</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead className="pr-6">Asistencia</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inscriptos.map((inscripcion, i) => (
                                        <TableRow key={inscripcion.id}>
                                            <TableCell className="pl-6 text-muted-foreground">{i + 1}</TableCell>
                                            <TableCell className="font-medium">{inscripcion.user.name}</TableCell>
                                            <TableCell className="hidden text-muted-foreground md:table-cell">
                                                {inscripcion.user.email}
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                {inscripcion.asistio ? (
                                                    <Badge className="rounded-full border-transparent bg-primary/15 text-primary">
                                                        Asistió
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                )}
            </div>
        </>
    );
}

function Dato({
    icono: Icono,
    titulo,
    children,
}: {
    icono: typeof CalendarDays;
    titulo: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <Icono className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{titulo}</span>
                {children}
            </div>
        </div>
    );
}
