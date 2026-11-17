import { Link } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import CupoBar from '@/components/cupo-bar';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import EventoImagen from '@/components/evento-imagen';
import FechaBloque from '@/components/fecha-bloque';
import { Card, CardContent } from '@/components/ui/card';
import { formatearHora } from '@/lib/fechas';

export interface EventoTarjetaData {
    id: number;
    titulo: string;
    fecha_inicio: string;
    cupo: number;
    estado: EstadoEvento;
    imagen_url: string | null;
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
        <Link href={href} className="group">
            <Card className="h-full gap-4 overflow-hidden pt-0 pb-5 transition-colors group-hover:border-primary/40">
                <EventoImagen
                    url={evento.imagen_url}
                    categoriaId={evento.categoria.id}
                    color={evento.categoria.color}
                    alt={evento.titulo}
                    className="h-36 w-full"
                />
                <CardContent className="flex gap-4 px-5">
                    <FechaBloque fecha={evento.fecha_inicio} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                            <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} />
                            {mostrarEstado && <EstadoBadge estado={evento.estado} />}
                        </div>
                        <h3 className="line-clamp-2 leading-snug font-semibold group-hover:text-primary">
                            {evento.titulo}
                        </h3>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">
                                {evento.lugar.nombre} · {formatearHora(evento.fecha_inicio)} h
                            </span>
                        </p>
                    </div>
                </CardContent>
                <CardContent className="mt-auto flex flex-col gap-1.5 px-5">
                    <CupoBar inscriptos={evento.inscriptos_count} cupo={evento.cupo} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                        {libres === 0 ? 'Sin lugares' : `${libres} ${libres === 1 ? 'lugar libre' : 'lugares libres'}`} ·{' '}
                        {evento.inscriptos_count} de {evento.cupo}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
