import { Head, Link } from '@inertiajs/react';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import FechaBloque from '@/components/fecha-bloque';
import { formatearHora } from '@/lib/fechas';

interface EventoPortada {
    id: number;
    titulo: string;
    fecha_inicio: string;
    cupo: number;
    solo_registrados: boolean;
    inscriptos_count: number;
    categoria: { id: number; nombre: string; color: string | null };
    lugar: { id: number; nombre: string };
}

interface Props {
    eventos: EventoPortada[];
    imagen: string | null;
}

export default function Index({ eventos, imagen }: Props) {
    return (
        <>
            <Head title="Inicio" />

            <section className="relative">
                {imagen && <img src={imagen} alt="Facultad de Ciencias Exactas" className="h-56 w-full object-cover sm:h-80" />}
                <div className="bg-primary px-4 py-6 text-primary-foreground sm:px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">Charlas, talleres y cursos</h1>
                    <p className="mt-1 max-w-2xl text-primary-foreground/90">
                        Actividades académicas y de extensión de la Facultad de Ciencias Exactas abiertas a estudiantes, docentes y
                        público en general.
                    </p>
                </div>
            </section>

            <div className="grid gap-10 px-4 py-8 sm:px-6 lg:grid-cols-3">
                <section className="lg:col-span-2">
                    <div className="flex items-baseline justify-between gap-4 border-b pb-3">
                        <h2 className="text-xl font-semibold">Próximos eventos</h2>
                        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                            Ver todos los eventos
                        </Link>
                    </div>

                    {eventos.length === 0 ? (
                        <p className="py-6 text-muted-foreground">
                            Por el momento no hay eventos con inscripción abierta. Los nuevos se publican en esta página.
                        </p>
                    ) : (
                        <ul className="divide-y">
                            {eventos.map((evento) => {
                                const libres = Math.max(0, evento.cupo - evento.inscriptos_count);

                                return (
                                    <li key={evento.id}>
                                        <Link
                                            href={`/cartelera/${evento.id}`}
                                            className="group flex gap-4 py-4 focus-visible:outline-2 focus-visible:outline-ring"
                                        >
                                            <FechaBloque fecha={evento.fecha_inicio} />
                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} />
                                                <h3 className="font-semibold group-hover:text-primary group-hover:underline">
                                                    {evento.titulo}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatearHora(evento.fecha_inicio)} h, {evento.lugar.nombre}
                                                </p>
                                                <p className="text-sm">
                                                    {libres === 0
                                                        ? 'Sin lugares disponibles'
                                                        : `${libres} ${libres === 1 ? 'lugar disponible' : 'lugares disponibles'}`}
                                                    {!evento.solo_registrados && (
                                                        <span className="font-medium text-primary"> · Abierto al público</span>
                                                    )}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <aside className="flex flex-col gap-8 text-sm lg:border-l lg:pl-8">
                    <section className="flex flex-col gap-3">
                        <h2 className="text-base font-semibold">Cómo inscribirse</h2>
                        <ol className="flex list-decimal flex-col gap-2 pl-5">
                            <li>Entrá al evento y revisá fecha, lugar y cupo.</li>
                            <li>
                                Si es abierto al público, completá tus datos. Si es solo para registrados, ingresá con tu cuenta o
                                creá una.
                            </li>
                            <li>Te llega un mail con la confirmación. Después del evento podés descargar el certificado.</li>
                        </ol>
                        <p className="text-muted-foreground">
                            Algunas actividades requieren aprobación del organizador o presentar documentación.
                        </p>
                    </section>

                    <section className="flex flex-col gap-3 border-t pt-6">
                        <h2 className="text-base font-semibold">Consultas</h2>
                        <p>
                            Secretaría de Extensión
                            <br />
                            Facultad de Ciencias Exactas, UNSa
                            <br />
                            Av. Bolivia 5150, Salta
                        </p>
                        <a href="mailto:eventos.exactas@gmail.com" className="font-medium text-primary hover:underline">
                            eventos.exactas@gmail.com
                        </a>
                    </section>
                </aside>
            </div>
        </>
    );
}
