import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarX, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatearFecha } from '@/lib/fechas';
import type { BreadcrumbItem } from '@/types';

interface Evento {
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
    estado: string;
    orden: string;
    direccion: string;
    por_pagina: number;
}

interface Props {
    eventos: EventosPaginados;
    categorias: { id: number; nombre: string }[];
    filtros: Filtros;
}

type Vista = 'tarjetas' | 'tabla';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Eventos', href: '/eventos' }];

// Radix Select no acepta value vacío, usamos "todos" para "sin filtro"
const TODOS = 'todos';

export default function Index({ eventos, categorias, filtros }: Props) {
    const page = usePage();
    const permisos = (page.props as { permisos?: string[] }).permisos ?? [];
    const vistaUrl = new URL(page.url, 'http://localhost').searchParams.get('vista');
    const vista: Vista = vistaUrl === 'tabla' ? 'tabla' : 'tarjetas';

    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [categoria, setCategoria] = useState(filtros.categoria ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');
    const [porPagina, setPorPagina] = useState(filtros.por_pagina ?? 10);
    const orden = filtros.orden ?? 'fecha_inicio';
    const direccion = filtros.direccion ?? 'asc';

    // Siempre mandamos todos los criterios, así no se pierde ninguno
    const visitar = (cambios: Record<string, string | number> = {}) => {
        router.get(
            '/eventos',
            {
                buscar,
                categoria,
                estado,
                orden,
                direccion,
                por_pagina: porPagina,
                vista,
                ...cambios,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const aplicarFiltros = (e: FormEvent) => {
        e.preventDefault();
        visitar();
    };

    const limpiarFiltros = () => {
        setBuscar('');
        setCategoria('');
        setEstado('');
        setPorPagina(10);
        router.get('/eventos', { vista });
    };

    const ordenarPor = (campo: string) => {
        const nuevaDireccion = orden === campo && direccion === 'asc' ? 'desc' : 'asc';
        visitar({ orden: campo, direccion: nuevaDireccion });
    };

    const iconoOrden = (campo: string) => {
        if (orden !== campo) return <ArrowUpDown className="size-3.5 opacity-40" />;
        return direccion === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
    };

    const hayFiltros = filtros.buscar !== '' || filtros.categoria !== '' || filtros.estado !== '';

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

                <form onSubmit={aplicarFiltros} className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder="Buscar por título..."
                                className="h-10 pl-9"
                            />
                        </div>
                        <Button type="submit" className="h-10">
                            Buscar
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={categoria || TODOS} onValueChange={(v) => setCategoria(v === TODOS ? '' : v)}>
                            <SelectTrigger className="w-full sm:w-48" aria-label="Categoría">
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

                        <Select value={estado || TODOS} onValueChange={(v) => setEstado(v === TODOS ? '' : v)}>
                            <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-40" aria-label="Estado">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TODOS}>Todos los estados</SelectItem>
                                <SelectItem value="publicado">Publicado</SelectItem>
                                <SelectItem value="finalizado">Finalizado</SelectItem>
                                <SelectItem value="borrador">Borrador</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={String(porPagina)} onValueChange={(v) => setPorPagina(Number(v))}>
                            <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-36" aria-label="Por página">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 por página</SelectItem>
                                <SelectItem value="10">10 por página</SelectItem>
                                <SelectItem value="20">20 por página</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button type="submit" variant="secondary">
                            Filtrar
                        </Button>
                        {hayFiltros && (
                            <Button type="button" variant="ghost" onClick={limpiarFiltros}>
                                Limpiar
                            </Button>
                        )}

                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={vista}
                            onValueChange={(v) => v && visitar({ vista: v })}
                            className="ml-auto"
                        >
                            <ToggleGroupItem value="tarjetas" aria-label="Ver como tarjetas">
                                <LayoutGrid />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="tabla" aria-label="Ver como tabla">
                                <List />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </form>

                {eventos.data.length === 0 ? (
                    <Card>
                        <EmptyState
                            icono={CalendarX}
                            titulo="No hay eventos con esos filtros"
                            descripcion="Probá con otra búsqueda o limpiá los filtros."
                        />
                    </Card>
                ) : vista === 'tarjetas' ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {eventos.data.map((evento) => (
                            <EventoTarjeta key={evento.id} evento={evento} href={`/eventos/${evento.id}`} />
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
                                {eventos.data.map((evento) => (
                                    <TableRow key={evento.id}>
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
