import { Head, router } from '@inertiajs/react';
import { CalendarX, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import EmptyState from '@/components/empty-state';
import EventoTarjeta, { type EventoTarjetaData } from '@/components/evento-tarjeta';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EventosPaginados {
    data: EventoTarjetaData[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    eventos: EventosPaginados;
    categorias: { id: number; nombre: string; color: string | null }[];
    filtros: { buscar: string; categoria: string };
}

export default function Index({ eventos, categorias, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    const visitar = (cambios: Record<string, string> = {}) => {
        router.get('/', { buscar, categoria: filtros.categoria, ...cambios }, { preserveState: true, preserveScroll: true });
    };

    const aplicar = (e: FormEvent) => {
        e.preventDefault();
        visitar();
    };

    return (
        <>
            <Head title="Cartelera" />

            <section className="flex flex-col gap-4 border-b px-4 pt-8 pb-6 md:pt-10">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Eventos de la facultad</h1>
                    <p className="mt-1 text-muted-foreground">Próximas charlas, talleres y cursos.</p>
                </div>

                <form onSubmit={aplicar} className="flex w-full max-w-xl gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                            placeholder="Buscar eventos..."
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit">
                        Buscar
                    </Button>
                </form>

                <div className="flex flex-wrap items-center gap-1.5">
                    <FiltroCategoria activo={filtros.categoria === ''} onClick={() => visitar({ categoria: '' })}>
                        Todas
                    </FiltroCategoria>
                    {categorias.map((c) => (
                        <FiltroCategoria
                            key={c.id}
                            activo={filtros.categoria === String(c.id)}
                            onClick={() => visitar({ categoria: String(c.id) })}
                        >
                            <span
                                className="size-2 rounded-full bg-muted-foreground"
                                style={c.color ? { backgroundColor: c.color } : undefined}
                            />
                            {c.nombre}
                        </FiltroCategoria>
                    ))}
                </div>
            </section>

            <div className="flex flex-col gap-6 px-4 pt-6 pb-12">
                <p className="text-sm text-muted-foreground tabular-nums">
                    {eventos.total} {eventos.total === 1 ? 'evento' : 'eventos'}
                </p>

                {eventos.data.length === 0 ? (
                    <Card>
                        <EmptyState
                            icono={CalendarX}
                            titulo="No hay eventos con esos filtros"
                            descripcion="Probá con otra búsqueda o mirá todas las categorías."
                        />
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {eventos.data.map((evento) => (
                            <EventoTarjeta
                                key={evento.id}
                                evento={evento}
                                href={`/cartelera/${evento.id}`}
                                mostrarEstado={false}
                            />
                        ))}
                    </div>
                )}

                {eventos.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!eventos.prev_page_url}
                            onClick={() => eventos.prev_page_url && router.get(eventos.prev_page_url)}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm">
                            Página {eventos.current_page} de {eventos.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!eventos.next_page_url}
                            onClick={() => eventos.next_page_url && router.get(eventos.next_page_url)}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

function FiltroCategoria({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                activo ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent',
            )}
        >
            {children}
        </button>
    );
}
