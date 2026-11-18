import { Link } from '@inertiajs/react';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import CupoBar from '@/components/cupo-bar';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import EventoImagen from '@/components/evento-imagen';
import FechaBloque from '@/components/fecha-bloque';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatearHora } from '@/lib/fechas';

export interface EventoTarjetaData {
    id: number;
    titulo: string;
    fecha_inicio: string;
    cupo: number;
    estado: EstadoEvento;
    imagen_url: string | null;
    solo_registrados: boolean;
    inscriptos_count: number;
    categoria: { id: number; nombre: string; color: string | null };
    lugar: { id: number; nombre: string };
}

interface Props {
    evento: EventoTarjetaData;
    href: string;
    mostrarEstado?: boolean;
}

export default function EventoTarjeta({ evento, href, mostrarEstado = true }: Props) {
    const libres = Math.max(0, evento.cupo - evento.inscriptos_count);

    return (
        <Link href={href} className="group rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <Card className="h-full gap-0 overflow-hidden py-0 transition-colors group-hover:border-primary/50">
                <EventoImagen
                    url={evento.imagen_url}
                    categoria={evento.categoria.nombre}
                    color={evento.categoria.color}
                    alt={evento.titulo}
                    className="h-28 w-full border-b"
                />
                <CardContent className="flex flex-1 gap-4 px-4 py-4">
                    <FechaBloque fecha={evento.fecha_inicio} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                            <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} />
                            {mostrarEstado && <EstadoBadge estado={evento.estado} />}
                        </div>
                        <h3 className="line-clamp-2 leading-snug font-semibold group-hover:text-primary">
                            {evento.titulo}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">
                            {evento.lugar.nombre}, {formatearHora(evento.fecha_inicio)} h
                        </p>
                        {!evento.solo_registrados && (
                            <Badge variant="secondary" className="mt-1 w-fit">
                                Abierto al público
                            </Badge>
                        )}
                    </div>
                </CardContent>
                <div className="flex flex-col gap-1.5 border-t px-4 py-3">
                    <CupoBar inscriptos={evento.inscriptos_count} cupo={evento.cupo} className="h-1" />
                    <p className="flex justify-between text-xs text-muted-foreground tabular-nums">
                        <span>{libres === 0 ? 'Sin lugares' : `${libres} ${libres === 1 ? 'lugar libre' : 'lugares libres'}`}</span>
                        <span>
                            {evento.inscriptos_count} de {evento.cupo}
                        </span>
                    </p>
                </div>
            </Card>
        </Link>
    );
}
