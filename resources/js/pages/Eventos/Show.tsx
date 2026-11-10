import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, MapPin, Mic, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
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
    estado: 'borrador' | 'publicado' | 'cancelado' | 'finalizado';
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
    flash?: {
        success?: string;
        error?: string;
    };
}

const estilosEstado: Record<Evento['estado'], string> = {
    borrador: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    publicado: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    finalizado: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
};

const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-AR', {
        timeZone: 'UTC',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });

const formatearHora = (fecha: string) =>
    new Date(fecha).toLocaleTimeString('es-AR', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
    });

export default function Show({
    evento,
    puedeGestionar,
    inscriptos,
    puedeInscribirse,
    estaInscripto,
    motivoSinInscripcion,
    yaPaso,
    flash,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Eventos', href: '/eventos' },
        { title: evento.titulo, href: `/eventos/${evento.id}` },
    ];

    const porcentaje = Math.min(100, Math.round((evento.inscriptos_count / evento.cupo) * 100));
    const lugaresLibres = Math.max(0, evento.cupo - evento.inscriptos_count);

    const inscribirme = () => {
        router.post(`/eventos/${evento.id}/inscripcion`, {}, { preserveScroll: true });
    };

    const cancelarInscripcion = () => {
        if (confirm('¿Seguro que querés cancelar tu inscripción?')) {
            router.delete(`/eventos/${evento.id}/inscripcion`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={evento.titulo} />

            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div>
                    <Link
                        href="/eventos"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Volver al listado
                    </Link>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="flex flex-col gap-4 rounded-xl border p-6 lg:col-span-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {evento.categoria.nombre}
                            </span>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${estilosEstado[evento.estado]}`}
                            >
                                {evento.estado}
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold">{evento.titulo}</h1>

                        <p className="text-sm whitespace-pre-line">{evento.descripcion}</p>

                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <div className="flex items-start gap-2">
                                <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />
                                <div>
                                    <div className="capitalize">{formatearFecha(evento.fecha_inicio)}</div>
                                    <div className="text-muted-foreground">
                                        Hasta las {formatearHora(evento.fecha_fin)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                                <div>
                                    <div>{evento.lugar.nombre}</div>
                                    {evento.lugar.direccion && (
                                        <div className="text-muted-foreground">{evento.lugar.direccion}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <User className="mt-0.5 size-4 text-muted-foreground" />
                                <div>
                                    <div className="text-muted-foreground">Organiza</div>
                                    <div>{evento.organizador.name}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-2 font-medium">Disertantes</h2>
                            {evento.disertantes.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sin disertantes cargados.</p>
                            )}
                            <ul className="flex flex-col gap-2">
                                {evento.disertantes.map((d) => (
                                    <li key={d.id} className="flex items-start gap-2 text-sm">
                                        <Mic className="mt-0.5 size-4 text-muted-foreground" />
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
                        </div>
                    </div>

                    <div className="flex h-fit flex-col gap-4 rounded-xl border p-6">
                        <div>
                            <div className="flex items-baseline justify-between">
                                <h2 className="font-medium">Cupo</h2>
                                <span className="text-sm">
                                    {evento.inscriptos_count} / {evento.cupo}
                                </span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-muted">
                                <div
                                    className={`h-2 rounded-full ${porcentaje >= 100 ? 'bg-red-500' : 'bg-primary'}`}
                                    style={{ width: `${porcentaje}%` }}
                                />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {lugaresLibres === 0
                                    ? 'No quedan lugares.'
                                    : `Quedan ${lugaresLibres} ${lugaresLibres === 1 ? 'lugar' : 'lugares'}.`}
                            </p>
                        </div>

                        {puedeInscribirse && estaInscripto && (
                            <div className="flex flex-col gap-2">
                                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                                    Estás inscripto en esta charla.
                                </div>
                                {!yaPaso && (
                                    <Button variant="outline" onClick={cancelarInscripcion}>
                                        Cancelar inscripción
                                    </Button>
                                )}
                            </div>
                        )}

                        {puedeInscribirse && !estaInscripto && (
                            <div className="flex flex-col gap-2">
                                <Button onClick={inscribirme} disabled={motivoSinInscripcion !== null}>
                                    Inscribirme
                                </Button>
                                {motivoSinInscripcion && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {motivoSinInscripcion}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {puedeGestionar && (
                    <div className="rounded-xl border">
                        <div className="flex items-center justify-between p-4">
                            <h2 className="font-medium">Inscriptos ({inscriptos.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">#</th>
                                        <th className="px-4 py-3 font-medium">Nombre</th>
                                        <th className="hidden px-4 py-3 font-medium md:table-cell">Email</th>
                                        <th className="px-4 py-3 font-medium">Asistió</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inscriptos.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                Todavía no hay inscriptos.
                                            </td>
                                        </tr>
                                    )}
                                    {inscriptos.map((inscripcion, i) => (
                                        <tr key={inscripcion.id} className="border-t">
                                            <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                                            <td className="px-4 py-3">{inscripcion.user.name}</td>
                                            <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                {inscripcion.user.email}
                                            </td>
                                            <td className="px-4 py-3">{inscripcion.asistio ? 'Sí' : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
