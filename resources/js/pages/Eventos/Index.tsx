import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarX, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import CupoBar from '@/components/cupo-bar';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import EmptyState from '@/components/empty-state';
import EstadoBadge, { type EstadoEvento } from '@/components/estado-badge';
import EventoTarjeta from '@/components/evento-tarjeta';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatearFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Evento {
    id: number;
    titulo: string;
    fecha_inicio: string;
    cupo: number;
    estado: EstadoEvento;
    imagen_url: string | null;
    solo_registrados: boolean;
    inscriptos_count: number;
    proximo: number;
    categoria: { id: number; nombre: string; color: string | null };
    lugar: { id: number; nombre: string };
}

interface EventosPaginados {
    data: Evento[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Filtros {
    buscar: string;
    categoria: string;
    vista: string;
    orden: string;
    direccion: string;
    por_pagina: number;
}

interface Props {
    eventos: EventosPaginados;
    categorias: { id: number; nombre: string }[];
    contadores: Record<string, number>;
    filtros: Filtros;
}

type Modo = 'tarjetas' | 'tabla';

const pestanas = [
    { valor: 'proximos', titulo: 'Próximos' },
    { valor: 'finalizados', titulo: 'Finalizados' },
    { valor: 'todos', titulo: 'Todos' },
    { valor: 'borradores', titulo: 'Borradores' },
    { valor: 'cancelados', titulo: 'Cancelados' },
];

const vacios: Record<string, string> = {
    proximos: 'No hay eventos próximos',
    finalizados: 'Todavía no hay eventos finalizados',
    todos: 'No hay eventos',
    borradores: 'No tenés borradores',
    cancelados: 'No hay eventos cancelados',
};

const estaAtenuado = (evento: Evento) =>
    evento.estado === 'finalizado' || evento.estado === 'cancelado' || (evento.estado === 'publicado' && !evento.proximo);

// en "todos" el separador va donde termina el grupo de proximos
const empiezaFinalizados = (eventos: Evento[], i: number, vista: string) =>
    vista === 'todos' && !eventos[i].proximo && (i === 0 || eventos[i - 1].proximo === 1);

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Eventos', href: '/eventos' }];

// radix no acepta value vacio, uso 'todos'
const TODOS = 'todos';

export default function Index({ eventos, categorias, contadores, filtros }: Props) {
    const page = usePage();
    const permisos = (page.props as { permisos?: string[] }).permisos ?? [];
    const modoUrl = new URL(page.url, 'http://localhost').searchParams.get('modo');
    const modo: Modo = modoUrl === 'tabla' ? 'tabla' : 'tarjetas';
    const vista = filtros.vista;

    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [categoria, setCategoria] = useState(filtros.categoria ?? '');
    const orden = filtros.orden ?? '';
    const direccion = filtros.direccion ?? 'asc';

    const visitar = (cambios: Record<string, string> = {}) => {
        const datos = { buscar, categoria, vista, orden, direccion, modo, ...cambios };
        const conValor = Object.fromEntries(Object.entries(datos).filter(([, valor]) => valor !== ''));

        router.get('/eventos', conValor, { preserveState: true, preserveScroll: true, replace: true });
    };

    // espero a que termine de escribir para no buscar con cada letra
    useEffect(() => {
        if (buscar.trim() === filtros.buscar) return;
        const espera = setTimeout(() => visitar({ buscar: buscar.trim() }), 400);
        return () => clearTimeout(espera);
    }, [buscar]);

    const elegirCategoria = (valor: string) => {
        const nueva = valor === TODOS ? '' : valor;
        setCategoria(nueva);
        visitar({ categoria: nueva });
    };

    const limpiarFiltros = () => {
        setBuscar('');
        setCategoria('');
        router.get('/eventos', { vista, modo }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const ordenarPor = (campo: string) => {
        const nuevaDireccion = orden === campo && direccion === 'asc' ? 'desc' : 'asc';
        visitar({ orden: campo, direccion: nuevaDireccion });
    };

    const iconoOrden = (campo: string) => {
        if (orden !== campo) return <ArrowUpDown className="size-3.5 opacity-40" />;
        return direccion === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
    };

    const hayFiltros = !!filtros.buscar || !!filtros.categoria;

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Eventos" />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Eventos de la facultad" descripcion="Charlas, talleres y actividades.">
                    {permisos.includes('crear eventos') && (
                        <Button asChild>
                            <Link href="/eventos/create">
                                <Plus />
                                Nuevo evento
                            </Link>
                        </Button>
                    )}
                </PageHeader>

                <Tabs value={vista} onValueChange={(v) => visitar({ vista: v })}>
                    <TabsList className="max-w-full justify-start overflow-x-auto">
                        {pestanas
                            .filter((p) => p.valor in contadores)
                            .map((p) => (
                                <TabsTrigger key={p.valor} value={p.valor} className="gap-1.5">
                                    {p.titulo}
                                    <span className="text-muted-foreground tabular-nums">{contadores[p.valor]}</span>
                                </TabsTrigger>
                            ))}
                    </TabsList>
                </Tabs>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                            placeholder="Buscar por título..."
                            className="h-10 pl-9"
                            aria-label="Buscar por título"
                        />
                    </div>

                    <Select value={categoria || TODOS} onValueChange={elegirCategoria}>
                        <SelectTrigger className="h-10 flex-1 sm:w-52 sm:flex-none" aria-label="Categoría">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TODOS}>Todas las categorías</SelectItem>
                            {categorias.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hayFiltros && (
                        <Button type="button" variant="ghost" onClick={limpiarFiltros}>
                            Limpiar
                        </Button>
                    )}

                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={modo}
                        onValueChange={(v) => v && visitar({ modo: v })}
                    >
                        <ToggleGroupItem value="tarjetas" aria-label="Ver como tarjetas" className="h-10">
                            <LayoutGrid />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="tabla" aria-label="Ver como tabla" className="h-10">
                            <List />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {eventos.data.length === 0 ? (
                    <Card>
                        <EmptyState
                            icono={CalendarX}
                            titulo={hayFiltros ? 'No hay eventos con esos filtros' : vacios[vista]}
                            descripcion={hayFiltros ? 'Probá con otra búsqueda o limpiá los filtros.' : undefined}
                        />
                    </Card>
                ) : modo === 'tarjetas' ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {eventos.data.map((evento, i) => (
                            <Fragment key={evento.id}>
                                {empiezaFinalizados(eventos.data, i, vista) && (
                                    <h2 className="border-b pt-2 pb-2 font-semibold text-muted-foreground sm:col-span-2 lg:col-span-3">
                                        Finalizados
                                    </h2>
                                )}
                                <EventoTarjeta evento={evento} href={`/eventos/${evento.id}`} atenuado={estaAtenuado(evento)} />
                            </Fragment>
                        ))}
                    </div>
                ) : (
                    <Card className="py-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">
                                        <button type="button" onClick={() => ordenarPor('titulo')} className="flex items-center gap-1">
                                            Evento {iconoOrden('titulo')}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button type="button" onClick={() => ordenarPor('fecha_inicio')} className="flex items-center gap-1">
                                            Fecha {iconoOrden('fecha_inicio')}
                                        </button>
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell">Lugar</TableHead>
                                    <TableHead>
                                        <button type="button" onClick={() => ordenarPor('cupo')} className="flex items-center gap-1">
                                            Cupo {iconoOrden('cupo')}
                                        </button>
                                    </TableHead>
                                    <TableHead className="pr-6">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eventos.data.map((evento, i) => (
                                    <Fragment key={evento.id}>
                                        {empiezaFinalizados(eventos.data, i, vista) && (
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell colSpan={5} className="bg-muted pl-6 font-semibold text-muted-foreground">
                                                    Finalizados
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className={cn(estaAtenuado(evento) && 'bg-muted/50 text-muted-foreground')}>
                                            <TableCell className="pl-6">
                                                <Link href={`/eventos/${evento.id}`} className="font-medium hover:text-primary">
                                                    {evento.titulo}
                                                </Link>
                                                <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} />
                                            </TableCell>
                                            <TableCell>{formatearFecha(evento.fecha_inicio)}</TableCell>
                                            <TableCell className="hidden text-muted-foreground lg:table-cell">
                                                {evento.lugar.nombre}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    {evento.inscriptos_count} / {evento.cupo}
                                                </div>
                                                <CupoBar
                                                    inscriptos={evento.inscriptos_count}
                                                    cupo={evento.cupo}
                                                    className="mt-1 h-1.5 w-20"
                                                />
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <EstadoBadge estado={evento.estado} />
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {eventos.from ?? 0} a {eventos.to ?? 0} de {eventos.total} eventos
                    </p>

                    <div className="flex items-center gap-2">
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
                </div>
            </div>
        </>
    );
}
