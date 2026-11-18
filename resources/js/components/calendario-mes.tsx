import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EstadoEvento } from '@/components/estado-badge';
import { Button } from '@/components/ui/button';
import { capitalizar, formatearHora } from '@/lib/fechas';
import { estaAtenuado } from '@/lib/eventos';
import { cn } from '@/lib/utils';

export interface EventoCalendario {
    id: number;
    titulo: string;
    fecha_inicio: string;
    estado: EstadoEvento;
    proximo: number;
    categoria: { id: number; nombre: string; color: string | null };
}

interface Props {
    mes: string;
    eventos: EventoCalendario[];
    onCambiarMes: (mes: string) => void;
}

const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const sumarMeses = (mes: string, cantidad: number) => {
    const [anio, numero] = mes.split('-').map(Number);
    const fecha = new Date(Date.UTC(anio, numero - 1 + cantidad, 1));
    return fecha.toISOString().slice(0, 7);
};

const hoy = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function Chip({ evento }: { evento: EventoCalendario }) {
    const atenuado = estaAtenuado(evento);
    const color = evento.categoria.color;

    return (
        <Link
            href={`/eventos/${evento.id}`}
            title={evento.titulo}
            className={cn(
                'line-clamp-2 rounded border-l-4 px-1.5 py-0.5 text-xs hover:underline',
                atenuado ? 'border-muted-foreground/40 bg-muted text-muted-foreground' : 'bg-card',
            )}
            style={
                !atenuado && color
                    ? { borderLeftColor: color, backgroundColor: `color-mix(in srgb, ${color} 15%, var(--card))` }
                    : undefined
            }
        >
            {formatearHora(evento.fecha_inicio)} {evento.titulo}
        </Link>
    );
}

export default function CalendarioMes({ mes, eventos, onCambiarMes }: Props) {
    const [anio, numero] = mes.split('-').map(Number);
    const primerDia = new Date(Date.UTC(anio, numero - 1, 1));
    const diasDelMes = new Date(Date.UTC(anio, numero, 0)).getUTCDate();
    // la semana empieza el lunes
    const huecos = (primerDia.getUTCDay() + 6) % 7;
    const hoyTexto = hoy();

    const porDia: Record<string, EventoCalendario[]> = {};
    for (const evento of eventos) {
        const dia = evento.fecha_inicio.slice(0, 10);
        (porDia[dia] ??= []).push(evento);
    }

    const celdas = [
        ...Array.from({ length: huecos }, () => null),
        ...Array.from({ length: diasDelMes }, (_, i) => `${mes}-${String(i + 1).padStart(2, '0')}`),
    ];
    while (celdas.length % 7 !== 0) celdas.push(null);

    const titulo = capitalizar(primerDia.toLocaleDateString('es-AR', { timeZone: 'UTC', month: 'long', year: 'numeric' }));
    const diasConEventos = Object.keys(porDia).sort();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{titulo}</h2>
                <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => onCambiarMes(sumarMeses(mes, -1))} aria-label="Mes anterior">
                        <ChevronLeft />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onCambiarMes(hoyTexto.slice(0, 7))}>
                        Hoy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onCambiarMes(sumarMeses(mes, 1))} aria-label="Mes siguiente">
                        <ChevronRight />
                    </Button>
                </div>
            </div>

            <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
                <div className="grid grid-cols-7 border-b bg-muted text-sm font-medium text-muted-foreground">
                    {dias.map((d) => (
                        <div key={d} className="px-2 py-2">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {celdas.map((dia, i) => (
                        <div
                            key={i}
                            className={cn(
                                'flex min-h-28 flex-col gap-1 border-b p-1.5',
                                i % 7 !== 6 && 'border-r',
                                i >= celdas.length - 7 && 'border-b-0',
                                !dia && 'bg-muted/40',
                            )}
                        >
                            {dia && (
                                <>
                                    <span
                                        className={cn(
                                            'flex size-6 items-center justify-center rounded-full text-sm tabular-nums',
                                            dia === hoyTexto && 'bg-primary font-semibold text-primary-foreground',
                                        )}
                                    >
                                        {Number(dia.slice(8))}
                                    </span>
                                    {porDia[dia]?.map((evento) => <Chip key={evento.id} evento={evento} />)}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:hidden">
                {diasConEventos.length === 0 ? (
                    <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">No hay eventos en este mes.</p>
                ) : (
                    <ul className="divide-y rounded-lg border bg-card">
                        {diasConEventos.map((dia) => (
                            <li key={dia} className="flex flex-col gap-1.5 p-3">
                                <span className={cn('text-sm font-semibold', dia === hoyTexto && 'text-primary')}>
                                    {capitalizar(
                                        new Date(`${dia}T00:00:00Z`).toLocaleDateString('es-AR', {
                                            timeZone: 'UTC',
                                            weekday: 'long',
                                            day: 'numeric',
                                        }),
                                    )}
                                </span>
                                {porDia[dia].map((evento) => (
                                    <Chip key={evento.id} evento={evento} />
                                ))}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
