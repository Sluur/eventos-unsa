import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { Ticket } from 'lucide-react';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import ConfirmDelete from '@/components/confirm-delete';
import EmptyState from '@/components/empty-state';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import EstadoInscripcionBadge, { type EstadoInscripcion } from '@/components/estado-inscripcion-badge';
import FechaBloque from '@/components/fecha-bloque';
import PageHeader from '@/components/page-header';
import SeguirBoton from '@/components/seguir-boton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatearHora } from '@/lib/fechas';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Inscripcion {
    id: number;
    estado: EstadoInscripcion;
    asistio: boolean;
    encuesta_exists: boolean;
    motivo_rechazo: string | null;
    evento: {
        id: number;
        titulo: string;
        fecha_inicio: string;
        fecha_fin: string;
        estado: EstadoEvento;
        categoria: { id: number; nombre: string; color: string | null };
        lugar: { id: number; nombre: string };
    };
}

interface Props {
    inscripciones: Inscripcion[];
    contadores: Record<string, number>;
    vista: string;
    categorias: { id: number; nombre: string; color: string | null }[];
    disertantes: { id: number; nombre: string; apellido: string }[];
}

const pestanas = [
    { valor: 'proximas', titulo: 'Próximas', vacio: 'No tenés inscripciones a eventos próximos.' },
    { valor: 'pendientes', titulo: 'Pendientes de revisión', vacio: 'No tenés inscripciones esperando revisión.' },
    { valor: 'pasadas', titulo: 'Pasadas', vacio: 'Todavía no fuiste a ningún evento.' },
    { valor: 'canceladas', titulo: 'Canceladas y rechazadas', vacio: 'No tenés inscripciones canceladas ni rechazadas.' },
];

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mis inscripciones', href: '/mis-inscripciones' }];

export default function Index({ inscripciones, contadores, vista, categorias, disertantes }: Props) {
    setLayoutProps({ breadcrumbs });

    const pestana = pestanas.find((p) => p.valor === vista) ?? pestanas[0];
    const puedeCancelar = vista === 'proximas' || vista === 'pendientes';

    return (
        <>
            <Head title="Mis inscripciones" />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Mis inscripciones" descripcion="Los eventos en los que te anotaste y lo que seguís." />

                <Tabs
                    value={vista}
                    onValueChange={(v) => router.get('/mis-inscripciones', { vista: v }, { preserveScroll: true, replace: true })}
                >
                    <TabsList className="flex-wrap justify-start group-data-[orientation=horizontal]/tabs:h-auto">
                        {pestanas.map((p) => (
                            <TabsTrigger key={p.valor} value={p.valor} className="flex-none gap-1.5">
                                {p.titulo}
                                <span className="text-muted-foreground tabular-nums">{contadores[p.valor]}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {inscripciones.length === 0 ? (
                    <Card>
                        <EmptyState icono={Ticket} titulo={pestana.vacio}>
                            <Button variant="outline" asChild>
                                <Link href="/eventos">Ver eventos</Link>
                            </Button>
                        </EmptyState>
                    </Card>
                ) : (
                    <Card className="gap-0 py-0">
                        <ul className="divide-y">
                            {inscripciones.map((inscripcion) => {
                                const { evento } = inscripcion;
                                const atenuado = vista === 'pasadas' || vista === 'canceladas';

                                return (
                                    <li
                                        key={inscripcion.id}
                                        className={cn(
                                            'flex flex-col gap-4 p-4 sm:flex-row sm:items-center',
                                            atenuado && 'bg-muted/50 text-muted-foreground',
                                        )}
                                    >
                                        <div className="flex min-w-0 flex-1 items-start gap-4">
                                            <FechaBloque fecha={evento.fecha_inicio} />
                                            <div className="flex min-w-0 flex-col gap-1">
                                                <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} />
                                                <Link href={`/eventos/${evento.id}`} className="font-semibold hover:text-primary hover:underline">
                                                    {evento.titulo}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatearHora(evento.fecha_inicio)} h, {evento.lugar.nombre}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {evento.estado === 'cancelado' ? (
                                                        <EstadoBadge estado="cancelado" />
                                                    ) : (
                                                        <EstadoInscripcionBadge estado={inscripcion.estado} />
                                                    )}
                                                    {vista === 'pasadas' && (
                                                        <span className="text-sm">
                                                            {!inscripcion.asistio
                                                                ? 'Sin asistencia registrada'
                                                                : inscripcion.encuesta_exists
                                                                  ? 'Asististe'
                                                                  : 'Asististe. Para el certificado falta responder la encuesta.'}
                                                        </span>
                                                    )}
                                                </div>
                                                {inscripcion.estado === 'rechazada' && inscripcion.motivo_rechazo && (
                                                    <p className="text-sm">Motivo del rechazo: {inscripcion.motivo_rechazo}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 sm:justify-end">
                                            {vista === 'pasadas' && inscripcion.asistio && (
                                                <Button size="sm" asChild>
                                                    <a href={`/inscripciones/${inscripcion.id}/certificado`}>Descargar certificado</a>
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/eventos/${evento.id}`}>Ver evento</Link>
                                            </Button>
                                            {puedeCancelar && (
                                                <ConfirmDelete
                                                    url={`/eventos/${evento.id}/inscripcion`}
                                                    titulo="¿Cancelar tu inscripción?"
                                                    descripcion="Vas a liberar tu lugar y otra persona lo puede ocupar."
                                                    textoBoton="Cancelar inscripción"
                                                    textoCancelar="Volver"
                                                >
                                                    <Button variant="ghost" size="sm" className="text-destructive">
                                                        Cancelar inscripción
                                                    </Button>
                                                </ConfirmDelete>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>
                )}

                <section className="flex flex-col gap-4 border-t pt-6">
                    <div>
                        <h2 className="text-lg font-semibold">Siguiendo</h2>
                        <p className="text-sm text-muted-foreground">
                            Te mandamos un mail cuando se publica un evento de estas categorías o con estos disertantes.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold">Categorías</h3>
                            {categorias.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No seguís ninguna categoría. Podés seguirlas desde el detalle de un evento.
                                </p>
                            ) : (
                                <ul className="divide-y rounded-lg border bg-card">
                                    {categorias.map((c) => (
                                        <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2">
                                            <CategoriaEtiqueta nombre={c.nombre} color={c.color} className="text-sm text-foreground" />
                                            <SeguirBoton url={`/categorias/${c.id}/seguir`} siguiendo />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold">Disertantes</h3>
                            {disertantes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No seguís a ningún disertante. Podés seguirlos desde el detalle de un evento.
                                </p>
                            ) : (
                                <ul className="divide-y rounded-lg border bg-card">
                                    {disertantes.map((d) => (
                                        <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2">
                                            <span className="text-sm font-medium">
                                                {d.nombre} {d.apellido}
                                            </span>
                                            <SeguirBoton url={`/disertantes/${d.id}/seguir`} siguiendo />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
