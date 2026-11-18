import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import EstadoInscripcionBadge, { type EstadoInscripcion } from '@/components/estado-inscripcion-badge';
import FechaBloque from '@/components/fecha-bloque';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatearFecha, formatearHora } from '@/lib/fechas';
import type { BreadcrumbItem } from '@/types';

interface EventoResumen {
    id: number;
    titulo: string;
    fecha_inicio: string;
    cupo: number;
    categoria: { id: number; nombre: string; color: string | null };
    lugar: { id: number; nombre: string };
}

interface PropsGestion {
    rol: 'gestion';
    tarjetas: { proximos: number; pendientes: number; inscriptos: number; borradores: number };
    proximos: (EventoResumen & { inscriptos_count: number; pendientes_count: number })[];
    pendientes: { id: number; titulo: string; fecha_inicio: string; pendientes_count: number }[];
    sinAsistencia: { id: number; titulo: string; fecha_inicio: string }[];
    esAdmin: boolean;
}

interface InscripcionResumen {
    id: number;
    estado: EstadoInscripcion;
    encuesta_exists: boolean;
    evento: EventoResumen;
}

interface PropsAlumno {
    rol: 'alumno';
    tarjetas: { proximas: number; pendientes: number; certificados: number; encuestas: number };
    proximas: InscripcionResumen[];
    certificados: InscripcionResumen[];
}

type Props = PropsGestion | PropsAlumno;

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Resumen', href: '/dashboard' }];

function Tarjetas({ datos }: { datos: { titulo: string; valor: number; href: string }[] }) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {datos.map((t) => (
                <Link
                    key={t.titulo}
                    href={t.href}
                    className="rounded-lg border bg-card px-5 py-4 transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <span className="text-sm text-muted-foreground">{t.titulo}</span>
                    <span className="block text-3xl font-bold tabular-nums">{t.valor}</span>
                </Link>
            ))}
        </div>
    );
}

function FilaEvento({ evento, children }: { evento: EventoResumen; children?: React.ReactNode }) {
    return (
        <li className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
            <FechaBloque fecha={evento.fecha_inicio} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} />
                <Link href={`/eventos/${evento.id}`} className="font-semibold hover:text-primary hover:underline">
                    {evento.titulo}
                </Link>
                <span className="text-sm text-muted-foreground">
                    {formatearHora(evento.fecha_inicio)} h, {evento.lugar.nombre}
                </span>
                {children}
            </div>
        </li>
    );
}

function Gestion({ tarjetas, proximos, pendientes, sinAsistencia, esAdmin }: PropsGestion) {
    return (
        <>
            <Tarjetas
                datos={[
                    { titulo: 'Eventos próximos', valor: tarjetas.proximos, href: '/eventos' },
                    { titulo: 'Inscripciones para revisar', valor: tarjetas.pendientes, href: '/eventos' },
                    { titulo: 'Inscriptos en próximos', valor: tarjetas.inscriptos, href: '/eventos' },
                    { titulo: 'Borradores', valor: tarjetas.borradores, href: '/eventos?vista=borradores' },
                ]}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Próximos eventos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {proximos.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay eventos publicados para las próximas fechas.</p>
                        ) : (
                            <ul className="divide-y">
                                {proximos.map((e) => (
                                    <FilaEvento key={e.id} evento={e}>
                                        <span className="text-sm">
                                            {e.inscriptos_count} de {e.cupo} lugares ocupados
                                            {e.pendientes_count > 0 &&
                                                ` · ${e.pendientes_count} ${e.pendientes_count === 1 ? 'pendiente' : 'pendientes'}`}
                                        </span>
                                    </FilaEvento>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Para revisar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendientes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay inscripciones esperando revisión.</p>
                            ) : (
                                <ul className="flex flex-col divide-y">
                                    {pendientes.map((e) => (
                                        <li key={e.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">{e.titulo}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {e.pendientes_count} {e.pendientes_count === 1 ? 'pendiente' : 'pendientes'}
                                                </div>
                                            </div>
                                            <Button size="sm" asChild>
                                                <Link href={`/eventos/${e.id}/inscripciones`}>Revisar</Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Falta tomar asistencia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sinAsistencia.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Todos los eventos finalizados tienen la asistencia cargada.</p>
                            ) : (
                                <ul className="flex flex-col divide-y">
                                    {sinAsistencia.map((e) => (
                                        <li key={e.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">{e.titulo}</div>
                                                <div className="text-sm text-muted-foreground">{formatearFecha(e.fecha_inicio)}</div>
                                            </div>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/eventos/${e.id}/asistencia`}>Tomar</Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {esAdmin && (
                        <p className="text-sm text-muted-foreground">
                            La tasa de no show y los alumnos con faltas están en{' '}
                            <Link href="/estadisticas" className="font-medium text-primary hover:underline">
                                Estadísticas
                            </Link>
                            .
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

function Alumno({ tarjetas, proximas, certificados }: PropsAlumno) {
    return (
        <>
            <Tarjetas
                datos={[
                    { titulo: 'Inscripciones confirmadas', valor: tarjetas.proximas, href: '/mis-inscripciones' },
                    { titulo: 'Esperando revisión', valor: tarjetas.pendientes, href: '/mis-inscripciones?vista=pendientes' },
                    { titulo: 'Certificados', valor: tarjetas.certificados, href: '/mis-inscripciones?vista=pasadas' },
                    { titulo: 'Encuestas sin responder', valor: tarjetas.encuestas, href: '/mis-inscripciones?vista=pasadas' },
                ]}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tus próximos eventos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {proximas.length === 0 ? (
                            <div className="flex flex-col items-start gap-3">
                                <p className="text-sm text-muted-foreground">No estás inscripto a ningún evento próximo.</p>
                                <Button variant="outline" asChild>
                                    <Link href="/eventos">Ver eventos</Link>
                                </Button>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {proximas.map((i) => (
                                    <FilaEvento key={i.id} evento={i.evento}>
                                        <EstadoInscripcionBadge estado={i.estado} className="w-fit" />
                                    </FilaEvento>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Certificados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {certificados.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Cuando vayas a un evento y termine, vas a poder descargar el certificado acá.
                            </p>
                        ) : (
                            <ul className="flex flex-col divide-y">
                                {certificados.map((i) => (
                                    <li key={i.id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                                        <span className="font-medium">{i.evento.titulo}</span>
                                        {!i.encuesta_exists && (
                                            <span className="text-sm text-muted-foreground">Falta responder la encuesta.</span>
                                        )}
                                        <Button size="sm" variant="outline" className="w-fit" asChild>
                                            <a href={`/inscripciones/${i.id}/certificado`}>Descargar certificado</a>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default function Index(props: Props) {
    const { auth } = usePage().props;
    setLayoutProps({ breadcrumbs });

    const nombre = auth.user?.name.split(' ')[0] ?? '';

    return (
        <>
            <Head title="Resumen" />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader
                    titulo={`Hola, ${nombre}`}
                    descripcion={
                        props.rol === 'gestion'
                            ? props.esAdmin
                                ? 'Lo que pasa en todos los eventos de la facultad.'
                                : 'Lo que tenés pendiente en tus eventos.'
                            : 'Tus inscripciones y certificados.'
                    }
                />
                {props.rol === 'gestion' ? <Gestion {...props} /> : <Alumno {...props} />}
            </div>
        </>
    );
}
