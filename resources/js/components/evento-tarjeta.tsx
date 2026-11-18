import { Link } from '@inertiajs/react';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import CupoBar from '@/components/cupo-bar';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import FechaBloque from '@/components/fecha-bloque';
import { Card, CardContent } from '@/components/ui/card';
import { formatearHora } from '@/lib/fechas';
import { cn } from '@/lib/utils';

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
    atenuado?: boolean;
}

export default function EventoTarjeta({ evento, href, mostrarEstado = true, atenuado = false }: Props) {
    const libres = Math.max(0, evento.cupo - evento.inscriptos_count);

    return (
        <Link href={href} className="group rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <Card
                className={cn(
                    'h-full gap-0 overflow-hidden py-0 transition-colors group-hover:border-primary/50',
                    atenuado && 'bg-muted/50 text-muted-foreground',
                )}
            >
                {evento.imagen_url && (
                    <img src={evento.imagen_url} alt={evento.titulo} className={cn('h-28 w-full border-b object-cover', atenuado && 'grayscale')} />
                )}
                <CardContent className="flex flex-1 items-start gap-4 px-4 py-4">
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
                        {!evento.solo_registrados && <p className="text-sm font-medium text-primary">Abierto al público</p>}
                    </div>
                </CardContent>
                <div className="flex flex-col gap-1.5 border-t px-4 py-3">
                    <CupoBar inscriptos={evento.inscriptos_count} cupo={evento.cupo} className="h-1" />
                    <p className="flex justify-between text-sm text-muted-foreground tabular-nums">
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
