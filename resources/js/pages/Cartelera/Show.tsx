import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import CategoriaReglas, { type ReglasCategoria } from '@/components/categoria-reglas';
import CupoBar from '@/components/cupo-bar';
import EventoDato from '@/components/evento-dato';
import FechaBloque from '@/components/fecha-bloque';
import InscripcionInvitadoForm from '@/components/inscripcion-invitado-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalizar, formatearFechaLarga } from '@/lib/fechas';

export interface EventoPublico {
    id: number;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    inscripcion_hasta: string | null;
    cupo: number;
    solo_registrados: boolean;
    imagen_url: string | null;
    inscriptos_count: number;
    categoria: ReglasCategoria & { id: number; nombre: string; color: string | null };
    lugar: { id: number; nombre: string; direccion: string | null };
    disertantes: { id: number; nombre: string; apellido: string; biografia: string | null }[];
}

interface Props {
    evento: EventoPublico;
    motivoSinInscripcion: string | null;
    inscripcionCerrada: boolean;
}

export default function Show({ evento, motivoSinInscripcion, inscripcionCerrada }: Props) {
    const libres = Math.max(0, evento.cupo - evento.inscriptos_count);

    return (
        <>
            <Head title={evento.titulo} />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <Link
                    href="/"
                    className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Volver al inicio
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
                        <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} className="text-sm" />
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{evento.titulo}</h1>
                    </div>
                </div>

                <div className="grid gap-8 border-t pt-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-8 lg:col-span-2">
                        <section className="flex flex-col gap-5">
                            <h2 className="text-lg font-semibold">Sobre el evento</h2>
                            <p className="max-w-prose whitespace-pre-line">{evento.descripcion}</p>

                            <div className="grid gap-4 text-sm sm:grid-cols-2">
                                <EventoDato titulo="Cuándo">
                                    <span>{capitalizar(formatearFechaLarga(evento.fecha_inicio))}</span>
                                </EventoDato>
                                <EventoDato titulo="Dónde">
                                    <span>{evento.lugar.nombre}</span>
                                    {evento.lugar.direccion && <span className="text-muted-foreground">{evento.lugar.direccion}</span>}
                                </EventoDato>
                                <EventoDato titulo="Quién se inscribe">
                                    <span>
                                        {evento.solo_registrados ? 'Solo usuarios registrados' : 'Abierto al público, también invitados'}
                                    </span>
                                </EventoDato>
                            </div>
                        </section>

                        <section className="flex flex-col gap-4 border-t pt-6">
                            <h2 className="text-lg font-semibold">Disertantes</h2>
                            {evento.disertantes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin disertantes cargados.</p>
                            ) : (
                                <ul className="flex flex-col divide-y text-sm">
                                    {evento.disertantes.map((d) => (
                                        <li key={d.id} className="py-3 first:pt-0">
                                            <div className="font-medium">
                                                {d.nombre} {d.apellido}
                                            </div>
                                            {d.biografia && <div className="text-muted-foreground">{d.biografia}</div>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                    <Card className="h-fit lg:sticky lg:top-24">
                        <CardHeader>
                            <CardTitle>Inscripción</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-baseline justify-between text-sm">
                                    <span className="font-medium">
                                        {libres === 0
                                            ? 'No quedan lugares'
                                            : `Quedan ${libres} ${libres === 1 ? 'lugar' : 'lugares'}`}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {evento.inscriptos_count} / {evento.cupo}
                                    </span>
                                </div>
                                <CupoBar inscriptos={evento.inscriptos_count} cupo={evento.cupo} />
                                {evento.inscripcion_hasta && (
                                    <p className="text-sm text-muted-foreground">
                                        {inscripcionCerrada
                                            ? 'Inscripción cerrada'
                                            : `Inscripción abierta hasta el ${formatearFechaLarga(evento.inscripcion_hasta)}`}
                                    </p>
                                )}
                                <CategoriaReglas categoria={evento.categoria} />
                            </div>

                            {motivoSinInscripcion ? (
                                <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                                    {motivoSinInscripcion}
                                </p>
                            ) : !evento.solo_registrados ? (
                                <div className="flex flex-col gap-4">
                                    <InscripcionInvitadoForm
                                        eventoId={evento.id}
                                        documentacion={
                                            evento.categoria.requiere_documentacion
                                                ? evento.categoria.documentacion_descripcion
                                                : null
                                        }
                                    />
                                    <p className="text-center text-sm text-muted-foreground">
                                        ¿Tenés cuenta?{' '}
                                        <Link href={`/cartelera/${evento.id}/ingresar`} className="font-medium text-primary hover:underline">
                                            Ingresá
                                        </Link>
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm text-muted-foreground">Este evento es para usuarios registrados.</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" asChild>
                                            <Link href={`/cartelera/${evento.id}/ingresar`}>Ingresar</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href={`/cartelera/${evento.id}/registrarse`}>Registrarse</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
