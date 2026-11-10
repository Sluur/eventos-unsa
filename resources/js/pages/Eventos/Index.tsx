import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, MapPin, Plus, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Evento {
    id: number;
    titulo: string;
    fecha_inicio: string;
    cupo: number;
    estado: 'borrador' | 'publicado' | 'cancelado' | 'finalizado';
    inscriptos_count: number;
    categoria: { id: number; nombre: string };
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
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Eventos', href: '/eventos' }];

const estilosEstado: Record<Evento['estado'], string> = {
    borrador: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    publicado: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    finalizado: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
};

const claseSelect =
    'h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:bg-input/30';

// Las fechas se guardan tal cual en la base (UTC), así que las mostramos sin convertir zona
const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-AR', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export default function Index({ eventos, categorias, filtros, flash }: Props) {
    const permisos = (usePage().props as { permisos?: string[] }).permisos ?? [];
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [categoria, setCategoria] = useState(filtros.categoria ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');
    const [orden, setOrden] = useState(filtros.orden ?? 'fecha_inicio');
    const [direccion, setDireccion] = useState(filtros.direccion ?? 'asc');
    const [porPagina, setPorPagina] = useState(filtros.por_pagina ?? 10);

    const aplicarFiltros = (e: FormEvent) => {
        e.preventDefault();
        router.get('/eventos', {
            buscar,
            categoria,
            estado,
            orden,
            direccion,
            por_pagina: porPagina,
        });
    };

    const limpiarFiltros = () => {
        router.get('/eventos');
    };

    const ordenarPor = (campo: string) => {
        let nuevaDireccion = 'asc';
        if (orden === campo && direccion === 'asc') {
            nuevaDireccion = 'desc';
        }
        setOrden(campo);
        setDireccion(nuevaDireccion);
        router.get('/eventos', {
            buscar,
            categoria,
            estado,
            orden: campo,
            direccion: nuevaDireccion,
            por_pagina: porPagina,
        });
    };

    const indicadorOrden = (campo: string) => {
        if (orden !== campo) return ' ↕';
        return direccion === 'asc' ? ' ↑' : ' ↓';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Eventos" />

            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Eventos</h1>
                        <p className="text-sm text-muted-foreground">
                            Charlas, talleres y actividades de la facultad.
                        </p>
                    </div>

                    {permisos.includes('crear eventos') && (
                        <Button asChild>
                            <Link href="/eventos/create">
                                <Plus className="size-4" />
                                Nueva charla
                            </Link>
                        </Button>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <form
                    onSubmit={aplicarFiltros}
                    className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-5"
                >
                    <div className="relative lg:col-span-2">
                        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                        <Input
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                            placeholder="Buscar por título..."
                            className="pl-9"
                        />
                    </div>

                    <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className={claseSelect}
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>

                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className={claseSelect}
                    >
                        <option value="">Todos los estados</option>
                        <option value="publicado">Publicado</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="borrador">Borrador</option>
                        <option value="cancelado">Cancelado</option>
                    </select>

                    <select
                        value={porPagina}
                        onChange={(e) => setPorPagina(Number(e.target.value))}
                        className={claseSelect}
                    >
                        <option value={5}>5 por página</option>
                        <option value={10}>10 por página</option>
                        <option value={20}>20 por página</option>
                    </select>

                    <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
                        <Button type="submit">Buscar</Button>
                        <Button type="button" variant="outline" onClick={limpiarFiltros}>
                            Limpiar
                        </Button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th
                                    className="cursor-pointer px-4 py-3 font-medium select-none"
                                    onClick={() => ordenarPor('titulo')}
                                >
                                    Evento{indicadorOrden('titulo')}
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 font-medium select-none"
                                    onClick={() => ordenarPor('fecha_inicio')}
                                >
                                    Fecha{indicadorOrden('fecha_inicio')}
                                </th>
                                <th className="hidden px-4 py-3 font-medium lg:table-cell">Lugar</th>
                                <th
                                    className="cursor-pointer px-4 py-3 font-medium select-none"
                                    onClick={() => ordenarPor('cupo')}
                                >
                                    Cupo{indicadorOrden('cupo')}
                                </th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventos.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No se encontraron eventos con esos filtros.
                                    </td>
                                </tr>
                            )}

                            {eventos.data.map((evento) => {
                                const porcentaje = Math.min(
                                    100,
                                    Math.round((evento.inscriptos_count / evento.cupo) * 100),
                                );

                                return (
                                    <tr key={evento.id} className="border-t hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{evento.titulo}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {evento.categoria.nombre}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarDays className="size-4 text-muted-foreground" />
                                                {formatearFecha(evento.fecha_inicio)}
                                            </div>
                                        </td>
                                        <td className="hidden px-4 py-3 lg:table-cell">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="size-4" />
                                                {evento.lugar.nombre}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs">
                                                {evento.inscriptos_count} / {evento.cupo}
                                            </div>
                                            <div className="mt-1 h-1.5 w-20 rounded-full bg-muted">
                                                <div
                                                    className={`h-1.5 rounded-full ${porcentaje >= 100 ? 'bg-red-500' : 'bg-primary'}`}
                                                    style={{ width: `${porcentaje}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${estilosEstado[evento.estado]}`}
                                            >
                                                {evento.estado}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

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
        </AppLayout>
    );
}