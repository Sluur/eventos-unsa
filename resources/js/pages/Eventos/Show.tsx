import { Head, Link, setLayoutProps, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Ban, CircleCheck, ClipboardCheck, ClipboardList, Copy, FileDown, Star, FileText, Pencil, Trash2, Users } from 'lucide-react';
import ArchivoInput from '@/components/archivo-input';
import CancelarEventoDialog from '@/components/cancelar-evento-dialog';
import CategoriaReglas from '@/components/categoria-reglas';
import ConfirmDelete from '@/components/confirm-delete';
import CupoBar from '@/components/cupo-bar';
import MensajeInscriptosDialog from '@/components/mensaje-inscriptos-dialog';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import EmptyState from '@/components/empty-state';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import EstadoInscripcionBadge, { type EstadoInscripcion } from '@/components/estado-inscripcion-badge';
import EventoDato from '@/components/evento-dato';
import FechaBloque from '@/components/fecha-bloque';
import InputError from '@/components/input-error';
import InscriptoNombre, { emailInscripto } from '@/components/inscripto-nombre';
import SeguirBoton from '@/components/seguir-boton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { capitalizar, formatearFecha, formatearFechaLarga, formatearHora } from '@/lib/fechas';
import { cn } from '@/lib/utils';
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
    user: { id: number; name: string; email: string } | null;
    nombre_invitado: string | null;
    apellido_invitado: string | null;
    email_invitado: string | null;
}

interface Props {
    evento: Evento;
    puedeGestionar: boolean;
    inscriptos: Inscripto[];
    pendientes: number;
    mensajes: {
        id: number;
        asunto: string;
        cuerpo: string;
        destinatarios: 'confirmados' | 'pendientes' | 'todos';
        cantidad: number;
        created_at: string;
        autor: { id: number; name: string };
    }[];
    puedeInscribirse: boolean;
    estaInscripto: boolean;
    miInscripcion: {
        id: number;
        estado: EstadoInscripcion;
        motivo_rechazo: string | null;
        archivo: string | null;
        asistio: boolean;
        encuesta_exists: boolean;
    } | null;
    motivoSinInscripcion: string | null;
    yaPaso: boolean;
    inscripcionCerrada: boolean;
    encuesta: {
        promedio: number | null;
        cantidad: number;
        asistentes: number;
        comentarios: { puntaje: number; comentario: string; created_at: string }[];
    } | null;
    sigueCategoria: boolean;
    disertantesSeguidos: number[];
}

export default function Show({
    evento,
    puedeGestionar,
    inscriptos,
    pendientes,
    mensajes,
    puedeInscribirse,
    estaInscripto,
    miInscripcion,
    motivoSinInscripcion,
    yaPaso,
    inscripcionCerrada,
    encuesta,
    sigueCategoria,
    disertantesSeguidos,
}: Props) {
    const permisos = (usePage().props as { permisos?: string[] }).permisos ?? [];
    const puedeTomarAsistencia =
        puedeGestionar &&
        permisos.includes('tomar asistencia') &&
        ['publicado', 'finalizado'].includes(evento.estado);
    const sePuedeEditar = !['finalizado', 'cancelado'].includes(evento.estado);
    const puedeEditar = puedeGestionar && permisos.includes('editar eventos') && sePuedeEditar;
    const puedeEliminar = puedeGestionar && permisos.includes('eliminar eventos') && evento.estado !== 'finalizado';
    const puedeDuplicar = permisos.includes('crear eventos');
    const puedeRevisar = puedeGestionar && permisos.includes('revisar inscripciones');
    const puedeMensajear = puedeGestionar && permisos.includes('editar eventos') && evento.estado !== 'borrador';
    const puedeVerReportes = puedeGestionar && permisos.includes('ver reportes') && evento.estado !== 'borrador';

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

                {evento.imagen_url && (
                    <img
                        src={evento.imagen_url}
                        alt={evento.titulo}
                        className="h-40 w-full rounded-lg border object-cover sm:h-64"
                    />
                )}

                <div className="flex items-start gap-4 sm:gap-6">
                    <FechaBloque fecha={evento.fecha_inicio} grande />
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} className="text-sm" />
                            <EstadoBadge estado={evento.estado} />
                            <SeguirBoton
                                url={`/categorias/${evento.categoria.id}/seguir`}
                                siguiendo={sigueCategoria}
                                texto="Seguir categoría"
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{evento.titulo}</h1>
                    </div>
                </div>

                {(puedeRevisar || puedeTomarAsistencia || puedeMensajear || puedeVerReportes || puedeEditar || puedeDuplicar || puedeEliminar) && (
                    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {puedeRevisar && (
                                <Button size="sm" variant={pendientes > 0 ? 'default' : 'outline'} asChild>
                                    <Link href={`/eventos/${evento.id}/inscripciones`}>
                                        <ClipboardList />
                                        Revisar inscripciones
                                        {pendientes > 0 && ` (${pendientes} pendiente${pendientes === 1 ? '' : 's'})`}
                                    </Link>
                                </Button>
                            )}
                            {puedeTomarAsistencia && (
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/eventos/${evento.id}/asistencia`}>
                                        <ClipboardCheck />
                                        Tomar asistencia
                                    </Link>
                                </Button>
                            )}
                            {puedeVerReportes && (
                                <Button size="sm" variant="outline" asChild>
                                    <a href={`/eventos/${evento.id}/planilla`}>
                                        <FileDown />
                                        Planilla de asistencia
                                    </a>
                                </Button>
                            )}
                            {puedeMensajear && (
                                <MensajeInscriptosDialog
                                    eventoId={evento.id}
                                    confirmados={inscriptos.length}
                                    pendientes={pendientes}
                                />
                            )}
                        </div>
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

                <Card className="py-5">
                    <CardContent className="grid gap-6 px-5 md:grid-cols-2 md:gap-10">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-semibold">Cupo</h2>
                            <div className="flex items-baseline justify-between text-sm">
                                <span className="font-medium">
                                    {lugaresLibres === 0
                                        ? 'No quedan lugares'
                                        : `Quedan ${lugaresLibres} ${lugaresLibres === 1 ? 'lugar' : 'lugares'}`}
                                </span>
                                <span className="text-muted-foreground">
                                    {evento.inscriptos_count} de {evento.cupo}
                                </span>
                            </div>
                            <CupoBar inscriptos={evento.inscriptos_count} cupo={evento.cupo} />
                            <CategoriaReglas categoria={evento.categoria} />
                            {evento.estado === 'publicado' && !yaPaso && evento.inscripcion_hasta && (
                                <p className="text-sm text-muted-foreground">
                                    {inscripcionCerrada
                                        ? 'Inscripción cerrada'
                                        : `Inscripción abierta hasta el ${formatearFechaLarga(evento.inscripcion_hasta)}`}
                                </p>
                            )}
                        </div>

                        {puedeInscribirse && (
                            <div className="flex flex-col gap-3 border-t pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-10">
                                <h2 className="font-semibold">Tu inscripción</h2>

                                {estaInscripto ? (
                                    <>
                                        {miInscripcion?.estado === 'pendiente' ? (
                                            <div className="flex flex-col gap-1 text-sm">
                                                <EstadoInscripcionBadge estado="pendiente" />
                                                <span className="text-muted-foreground">
                                                    El organizador tiene que revisarla. Te avisamos por mail.
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                                                <CircleCheck className="size-4" />
                                                {yaPaso && miInscripcion?.asistio ? 'Asististe a este evento' : 'Estás inscripto'}
                                            </span>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {yaPaso && miInscripcion?.asistio && (
                                                <Button size="sm" asChild>
                                                    <a href={`/inscripciones/${miInscripcion.id}/certificado`}>Descargar certificado</a>
                                                </Button>
                                            )}
                                            {miInscripcion?.archivo && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`/inscripciones/${miInscripcion.id}/archivo`}>
                                                        <FileText />
                                                        Mi documentación
                                                    </a>
                                                </Button>
                                            )}
                                            {!yaPaso && evento.estado !== 'cancelado' && (
                                                <ConfirmDelete
                                                    url={`/eventos/${evento.id}/inscripcion`}
                                                    titulo="¿Cancelar tu inscripción?"
                                                    descripcion="Vas a liberar tu lugar y otra persona lo puede ocupar."
                                                    textoBoton="Cancelar inscripción"
                                                    textoCancelar="Volver"
                                                >
                                                    <Button variant="outline" size="sm">
                                                        Cancelar inscripción
                                                    </Button>
                                                </ConfirmDelete>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {miInscripcion?.estado === 'rechazada' && (
                                            <div className="flex flex-col gap-1 text-sm">
                                                <EstadoInscripcionBadge estado="rechazada" />
                                                {miInscripcion.motivo_rechazo && (
                                                    <span className="text-muted-foreground">
                                                        Motivo: {miInscripcion.motivo_rechazo}
                                                    </span>
                                                )}
                                                <span className="text-muted-foreground">Podés volver a inscribirte.</span>
                                            </div>
                                        )}
                                        {motivoSinInscripcion ? (
                                            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                                                {motivoSinInscripcion}
                                            </p>
                                        ) : (
                                            <>
                                                {requiereDocumentacion && (
                                                    <div className="flex flex-col gap-1.5">
                                                        <label htmlFor="archivo" className="text-sm font-medium">
                                                            Subí: {evento.categoria.documentacion_descripcion}
                                                        </label>
                                                        <ArchivoInput
                                                            id="archivo"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(archivo) => inscripcion.setData('archivo', archivo)}
                                                            invalido={!!inscripcion.errors.archivo}
                                                        />
                                                        <span className="text-sm text-muted-foreground">PDF, JPG o PNG de hasta 5 MB.</span>
                                                        <InputError message={inscripcion.errors.archivo} />
                                                    </div>
                                                )}
                                                <Button onClick={inscribirme} disabled={inscripcion.processing} className="w-full sm:w-fit">
                                                    {inscripcion.processing ? 'Enviando...' : 'Inscribirme'}
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-8 border-t pt-6 lg:grid-cols-3">
                    <section className="flex flex-col gap-5 lg:col-span-2">
                        <h2 className="text-lg font-semibold">Sobre el evento</h2>
                        <p className="max-w-prose whitespace-pre-line">{evento.descripcion}</p>

                        <div className="grid gap-4 text-sm sm:grid-cols-2">
                            <EventoDato titulo="Cuándo">
                                <span>{capitalizar(formatearFechaLarga(evento.fecha_inicio))}</span>
                                <span className="text-muted-foreground">Hasta las {formatearHora(evento.fecha_fin)}</span>
                            </EventoDato>
                            <EventoDato titulo="Dónde">
                                <span>{evento.lugar.nombre}</span>
                                {evento.lugar.direccion && <span className="text-muted-foreground">{evento.lugar.direccion}</span>}
                            </EventoDato>
                            <EventoDato titulo="Organiza">
                                <span>{evento.organizador.name}</span>
                            </EventoDato>
                            <EventoDato titulo="Quién se inscribe">
                                <span>
                                    {evento.solo_registrados ? 'Solo usuarios registrados' : 'Abierto al público, también invitados'}
                                </span>
                            </EventoDato>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold">Disertantes</h2>
                        {evento.disertantes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin disertantes cargados.</p>
                        ) : (
                            <ul className="flex flex-col divide-y text-sm">
                                {evento.disertantes.map((d) => (
                                    <li key={d.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                                        <div>
                                            <div className="font-medium">
                                                {d.nombre} {d.apellido}
                                            </div>
                                            {d.biografia && <div className="text-muted-foreground">{d.biografia}</div>}
                                        </div>
                                        <SeguirBoton
                                            url={`/disertantes/${d.id}/seguir`}
                                            siguiendo={disertantesSeguidos.includes(d.id)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
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
                                            <TableCell>
                                                <InscriptoNombre inscripto={inscripcion} />
                                            </TableCell>
                                            <TableCell className="hidden text-muted-foreground md:table-cell">
                                                {emailInscripto(inscripcion)}
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                {inscripcion.asistio ? (
                                                    <Badge className="border-transparent bg-primary/10 text-primary">
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

                {encuesta && (yaPaso || encuesta.cantidad > 0) && (
                    <section className="flex flex-col gap-4 border-t pt-6">
                        <h2 className="text-lg font-semibold">Encuesta de satisfacción</h2>
                        {encuesta.cantidad === 0 ? (
                            <p className="text-sm text-muted-foreground">Todavía no hay respuestas.</p>
                        ) : (
                            <>
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span className="text-3xl font-bold tabular-nums">{encuesta.promedio}</span>
                                    <Estrellas puntaje={Math.round(encuesta.promedio ?? 0)} />
                                    <span className="text-sm text-muted-foreground">
                                        {encuesta.cantidad} {encuesta.cantidad === 1 ? 'respuesta' : 'respuestas'} de {encuesta.asistentes}{' '}
                                        {encuesta.asistentes === 1 ? 'asistente' : 'asistentes'}
                                    </span>
                                </div>
                                {encuesta.comentarios.length > 0 && (
                                    <ul className="flex flex-col divide-y">
                                        {encuesta.comentarios.map((c, i) => (
                                            <li key={i} className="flex flex-col gap-1 py-3 first:pt-0">
                                                <div className="flex items-center gap-2">
                                                    <Estrellas puntaje={c.puntaje} />
                                                    <span className="text-sm text-muted-foreground">{formatearFecha(c.created_at)}</span>
                                                </div>
                                                <p className="text-sm whitespace-pre-line">{c.comentario}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </section>
                )}

                {puedeGestionar && (
                    <section className="flex flex-col gap-4 border-t pt-6">
                        <h2 className="text-lg font-semibold">Mensajes enviados</h2>
                        {mensajes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Todavía no se mandaron mensajes a los inscriptos.</p>
                        ) : (
                            <ul className="flex flex-col divide-y">
                                {mensajes.map((m) => (
                                    <li key={m.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <span className="font-medium">{m.asunto}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {formatearFecha(m.created_at)} · {m.autor.name}
                                            </span>
                                        </div>
                                        <p className="line-clamp-3 text-sm whitespace-pre-line text-muted-foreground">{m.cuerpo}</p>
                                        <span className="text-sm text-muted-foreground">
                                            A {m.destinatarios} · {m.cantidad} {m.cantidad === 1 ? 'persona' : 'personas'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}
            </div>
        </>
    );
}

function Estrellas({ puntaje }: { puntaje: number }) {
    return (
        <span className="flex" aria-label={`${puntaje} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={cn('size-4', n <= puntaje ? 'fill-acento text-acento' : 'text-muted-foreground')} />
            ))}
        </span>
    );
}
