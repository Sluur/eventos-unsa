import { Head, Link, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Lugar {
    id: number;
    nombre: string;
    capacidad: number;
}

interface Disertante {
    id: number;
    nombre: string;
    apellido: string;
}

interface Props {
    lugares: Lugar[];
    disertantes: Disertante[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Eventos', href: '/eventos' },
    { title: 'Nueva charla', href: '/eventos/create' },
];

const claseSelect =
    'h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:bg-input/30';

const nombreCompleto = (d: Disertante) => `${d.apellido}, ${d.nombre}`;

export default function Create({ lugares, disertantes }: Props) {
    const { data, setData, post, transform, processing, errors } = useForm({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        lugar_id: '',
        cupo: '',
        disertantes: [] as number[],
        estado: 'borrador',
    });

    const [busqueda, setBusqueda] = useState('');

    const lugarElegido = lugares.find((l) => String(l.id) === data.lugar_id);

    const seleccionados = disertantes.filter((d) => data.disertantes.includes(d.id));

    const sugerencias =
        busqueda.trim() === ''
            ? []
            : disertantes
                  .filter((d) => !data.disertantes.includes(d.id))
                  .filter((d) =>
                      nombreCompleto(d).toLowerCase().includes(busqueda.trim().toLowerCase()),
                  )
                  .slice(0, 8);

    const agregarDisertante = (id: number) => {
        setData('disertantes', [...data.disertantes, id]);
        setBusqueda('');
    };

    const quitarDisertante = (id: number) => {
        setData(
            'disertantes',
            data.disertantes.filter((d) => d !== id),
        );
    };

    const guardar = (estado: 'borrador' | 'publicado') => (e: FormEvent) => {
        e.preventDefault();
        transform((datos) => ({ ...datos, estado }));
        post('/eventos');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva charla" />

            <div className="p-4 md:p-6">
                <div className="max-w-2xl rounded-xl border p-6">
                    <h1 className="text-2xl font-semibold">Nueva charla</h1>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Podés guardarla como borrador y publicarla más adelante.
                    </p>

                    <form onSubmit={guardar('publicado')} className="flex flex-col gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="titulo">Título</Label>
                            <Input
                                id="titulo"
                                value={data.titulo}
                                onChange={(e) => setData('titulo', e.target.value)}
                            />
                            {errors.titulo && <p className="text-sm text-red-600">{errors.titulo}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <textarea
                                id="descripcion"
                                rows={4}
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                className="rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:bg-input/30"
                            />
                            {errors.descripcion && (
                                <p className="text-sm text-red-600">{errors.descripcion}</p>
                            )}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="fecha_inicio">Inicio</Label>
                                <Input
                                    id="fecha_inicio"
                                    type="datetime-local"
                                    value={data.fecha_inicio}
                                    onChange={(e) => setData('fecha_inicio', e.target.value)}
                                />
                                {errors.fecha_inicio && (
                                    <p className="text-sm text-red-600">{errors.fecha_inicio}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fecha_fin">Fin</Label>
                                <Input
                                    id="fecha_fin"
                                    type="datetime-local"
                                    value={data.fecha_fin}
                                    onChange={(e) => setData('fecha_fin', e.target.value)}
                                />
                                {errors.fecha_fin && (
                                    <p className="text-sm text-red-600">{errors.fecha_fin}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="lugar_id">Lugar</Label>
                                <select
                                    id="lugar_id"
                                    value={data.lugar_id}
                                    onChange={(e) => setData('lugar_id', e.target.value)}
                                    className={claseSelect}
                                >
                                    <option value="">Elegí un lugar</option>
                                    {lugares.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.nombre} (capacidad {l.capacidad})
                                        </option>
                                    ))}
                                </select>
                                {errors.lugar_id && (
                                    <p className="text-sm text-red-600">{errors.lugar_id}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cupo">Cupo</Label>
                                <Input
                                    id="cupo"
                                    type="number"
                                    min={1}
                                    max={lugarElegido?.capacidad}
                                    value={data.cupo}
                                    onChange={(e) => setData('cupo', e.target.value)}
                                />
                                {lugarElegido && (
                                    <p className="text-xs text-muted-foreground">
                                        Máximo {lugarElegido.capacidad} personas en este lugar.
                                    </p>
                                )}
                                {errors.cupo && <p className="text-sm text-red-600">{errors.cupo}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="buscar_disertante">Disertantes</Label>

                            {seleccionados.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {seleccionados.map((d) => (
                                        <span
                                            key={d.id}
                                            className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                                        >
                                            {nombreCompleto(d)}
                                            <button
                                                type="button"
                                                onClick={() => quitarDisertante(d.id)}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <Input
                                    id="buscar_disertante"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Escribí un nombre o apellido..."
                                    autoComplete="off"
                                />
                                {busqueda.trim() !== '' && (
                                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-md">
                                        {sugerencias.length === 0 && (
                                            <p className="px-3 py-2 text-sm text-muted-foreground">
                                                Sin resultados.
                                            </p>
                                        )}
                                        {sugerencias.map((d) => (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => agregarDisertante(d.id)}
                                                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                            >
                                                {nombreCompleto(d)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {errors.disertantes && (
                                <p className="text-sm text-red-600">{errors.disertantes}</p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" disabled={processing}>
                                Publicar
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={processing}
                                onClick={guardar('borrador')}
                            >
                                Guardar borrador
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/eventos">Cancelar</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
