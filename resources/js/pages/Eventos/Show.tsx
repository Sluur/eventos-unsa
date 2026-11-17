import { Head, Link, setLayoutProps, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Ban, Clock, Globe, Lock, CalendarDays, CircleCheck, ClipboardCheck, ClipboardList, Copy, FileText, MapPin, Mic, Pencil, Trash2, User, Users } from 'lucide-react';
import CancelarEventoDialog from '@/components/cancelar-evento-dialog';
import CategoriaReglas from '@/components/categoria-reglas';
import ConfirmDelete from '@/components/confirm-delete';
import CupoBar from '@/components/cupo-bar';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import EmptyState from '@/components/empty-state';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import EstadoInscripcionBadge, { type EstadoInscripcion } from '@/components/estado-inscripcion-badge';
import EventoDato from '@/components/evento-dato';
import EventoImagen from '@/components/evento-imagen';
import FechaBloque from '@/components/fecha-bloque';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    inscripcion_hasta: string | null;
    cupo: number;
    solo_registrados: boolean;
    estado: EstadoEvento;
    motivo_cancelacion: string | null;
    imagen_url: string | null;
    inscriptos_count: number;
    categoria: {
        id: number;
        nombre: string;
        color: string | null;
        requiere_aprobacion: boolean;
        requiere_documentacion: boolean;
        documentacion_descripcion: string | null;
    };
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
    pendientes: number;
    puedeInscribirse: boolean;
    estaInscripto: boolean;
    miInscripcion: { id: number; estado: EstadoInscripcion; motivo_rechazo: string | null; archivo: string | null } | null;
    motivoSinInscripcion: string | null;
    yaPaso: boolean;
    inscripcionCerrada: boolean;
}

export default function Show({
    evento,
    puedeGestionar,
    inscriptos,
    pendientes,
    puedeInscribirse,
    estaInscripto,
    miInscripcion,
    motivoSinInscripcion,
    yaPaso,
    inscripcionCerrada,
}: Props) {
    const permisos = (usePage().props as { permisos?: string[] }).permisos ?? [];
    const puedeTomarAsistencia =
        puedeGestionar &&
        permisos.includes('tomar asistencia') &&
        ['publicado', 'finalizado'].includes(evento.estado);
    const sePuedeEditar = !['finalizado', 'cancelado'].includes(evento.estado);
    const puedeEditar = puedeGestionar && permisos.includes('editar eventos') && sePuedeEditar;
    const puedeEliminar = puedeGestionar && permisos.includes('eliminar eventos');
    const puedeDuplicar = permisos.includes('crear eventos');
    const puedeRevisar = puedeGestionar && permisos.includes('revisar inscripciones');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Eventos', href: '/eventos' },
        { title: evento.titulo, href: `/eventos/${evento.id}` },
    ];

    const lugaresLibres = Math.max(0, evento.cupo - evento.inscriptos_count);

    const requiereDocumentacion = evento.categoria.requiere_documentacion;
    const inscripcion = useForm<{ archivo: File | null }>({ archivo: null });

    const inscribirme = () => {
        inscripcion.post(`/eventos/${evento.id}/inscripcion`, {
            preserveScroll: true,
            forceFormData: requiereDocumentacion,
            onSuccess: () => inscripcion.reset(),
        });
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

                <EventoImagen
                    url={evento.imagen_url}
                    categoriaId={evento.categoria.id}
                    color={evento.categoria.color}
                    alt={evento.titulo}
                    className="h-40 w-full rounded-xl sm:h-64"
                />

                {/* Encabezado */}
                <div className="flex items-start gap-4 sm:gap-6">
                    <FechaBloque fecha={evento.fecha_inicio} grande />
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} className="text-sm" />
                            <EstadoBadge estado={evento.estado} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{evento.titulo}</h1>
                    </div>
                </div>

                {(puedeEditar || puedeEliminar || puedeDuplicar) && (
                    <div className="flex flex-wrap gap-2">
                        {puedeEditar && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/eventos/${evento.id}/edit`}>
                                    <Pencil />
                                    Editar
                                </Link>
                            </Button>
                        )}
                        {puedeDuplicar && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/eventos/create?duplicar=${evento.id}`}>
                                    <Copy />
                                    Duplicar
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
                            {puedeInscribirse && <CategoriaReglas categoria={evento.categoria} />}
                            {evento.estado === 'publicado' && !yaPaso && evento.inscripcion_hasta && (
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="size-3.5" />
                                    {inscripcionCerrada
                                        ? 'Inscripción cerrada'
                                        : `Inscripción abierta hasta el ${formatearFechaLarga(evento.inscripcion_hasta)}`}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            {puedeInscribirse && estaInscripto && (
                                <>
                                    {miInscripcion?.archivo && (
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={`/inscripciones/${miInscripcion.id}/archivo`}>
                                                <FileText />
                                                Mi documentación
                                            </a>
                                        </Button>
                                    )}
                                    {miInscripcion?.estado === 'pendiente' ? (
                                        <EstadoInscripcionBadge estado="pendiente" />
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                                            <CircleCheck className="size-4" />
                                            Estás inscripto
                                        </span>
                                    )}
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
                                    {miInscripcion?.estado === 'rechazada' && (
                                        <div className="flex flex-col gap-1 text-sm sm:items-end">
                                            <EstadoInscripcionBadge estado="rechazada" />
                                            {miInscripcion.motivo_rechazo && (
                                                <span className="text-muted-foreground">
                                                    Motivo: {miInscripcion.motivo_rechazo}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">Podés volver a inscribirte.</span>
                                        </div>
                                    )}
                                    {requiereDocumentacion && motivoSinInscripcion === null && (
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="archivo" className="text-sm font-medium">
                                                Subí: {evento.categoria.documentacion_descripcion}
                                            </label>
                                            <Input
                                                id="archivo"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => inscripcion.setData('archivo', e.target.files?.[0] ?? null)}
                                                aria-invalid={!!inscripcion.errors.archivo}
                                            />
                                            <span className="text-xs text-muted-foreground">PDF, JPG o PNG de hasta 5 MB.</span>
                                            <InputError message={inscripcion.errors.archivo} />
                                        </div>
                                    )}
                                    <Button
                                        onClick={inscribirme}
                                        disabled={motivoSinInscripcion !== null || inscripcion.processing}
                                    >
                                        {inscripcion.processing ? 'Enviando...' : 'Inscribirme'}
                                    </Button>
                                    {motivoSinInscripcion && (
                                        <p className="text-sm text-muted-foreground">{motivoSinInscripcion}</p>
                                    )}
                                </div>
                            )}

                            {puedeRevisar && (
                                <Button variant={pendientes > 0 ? 'default' : 'outline'} asChild>
                                    <Link href={`/eventos/${evento.id}/inscripciones`}>
                                        <ClipboardList />
                                        Revisar inscripciones
                                        {pendientes > 0 && ` (${pendientes} pendiente${pendientes === 1 ? '' : 's'})`}
                                    </Link>
                                </Button>
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

                            <div className="grid gap-4 text-sm sm:grid-cols-2">
                                <EventoDato icono={CalendarDays} titulo="Cuándo">
                                    <span className="capitalize">{formatearFechaLarga(evento.fecha_inicio)}</span>
                                    <span className="text-muted-foreground">
                                        Hasta las {formatearHora(evento.fecha_fin)}
                                    </span>
                                </EventoDato>
                                <EventoDato icono={MapPin} titulo="Dónde">
                                    <span>{evento.lugar.nombre}</span>
                                    {evento.lugar.direccion && (
                                        <span className="text-muted-foreground">{evento.lugar.direccion}</span>
                                    )}
                                </EventoDato>
                                <EventoDato icono={User} titulo="Organiza">
                                    <span>{evento.organizador.name}</span>
                                </EventoDato>
                                <EventoDato icono={evento.solo_registrados ? Lock : Globe} titulo="Quién se inscribe">
                                    <span>
                                        {evento.solo_registrados
                                            ? 'Solo usuarios registrados'
                                            : 'Abierto al público, también invitados'}
                                    </span>
                                </EventoDato>
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
