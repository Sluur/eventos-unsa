import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

interface Fila {
    id: number;
    titulo: string;
    categoria: string;
    fecha: string;
    cupo: number;
    inscriptos: number;
    asistentes: number;
    porcentaje: number | null;
    no_show: number | null;
    puntaje: number | null;
}

interface Props {
    filas: Fila[];
    totales: { eventos: number; inscriptos: number; asistentes: number; porcentaje: number | null; no_show: number | null; puntaje: number | null };
    categorias: { id: number; nombre: string }[];
    filtros: { desde: string; hasta: string; categoria: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reportes', href: '/reportes' }];

// radix no acepta value vacio, uso 'todas'
const TODAS = 'todas';

export default function Index({ filas, totales, categorias, filtros }: Props) {
    setLayoutProps({ breadcrumbs });

    const visitar = (cambios: Partial<Props['filtros']>) => {
        const datos = { ...filtros, ...cambios };
        router.get('/reportes', Object.fromEntries(Object.entries(datos).filter(([, v]) => v !== '')), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const consulta = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v !== '')).toString();
    const porcentaje = (valor: number | null) => (valor === null ? '-' : `${valor}%`);

    return (
        <>
            <Head title="Reportes" />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader titulo="Reportes" descripcion="Inscripción, asistencia y encuesta de cada evento en el período elegido." />

                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="desde">Desde</Label>
                        <Input
                            id="desde"
                            type="date"
                            value={filtros.desde}
                            onChange={(e) => e.target.value && visitar({ desde: e.target.value })}
                            className="h-10 w-44"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="hasta">Hasta</Label>
                        <Input
                            id="hasta"
                            type="date"
                            value={filtros.hasta}
                            onChange={(e) => e.target.value && visitar({ hasta: e.target.value })}
                            className="h-10 w-44"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Categoría</Label>
                        <Select
                            value={filtros.categoria || TODAS}
                            onValueChange={(v) => visitar({ categoria: v === TODAS ? '' : v })}
                        >
                            <SelectTrigger className="h-10 w-48" aria-label="Categoría">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TODAS}>Todas las categorías</SelectItem>
                                {categorias.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 sm:ml-auto">
                        <Button variant="outline" className="h-10" asChild>
                            <a href={`/reportes/pdf?${consulta}`}>
                                <FileDown />
                                PDF
                            </a>
                        </Button>
                        <Button variant="outline" className="h-10" asChild>
                            <a href={`/reportes/excel?${consulta}`}>
                                <FileSpreadsheet />
                                Excel
                            </a>
                        </Button>
                    </div>
                </div>

                <Card className="py-0">
                    {filas.length === 0 ? (
                        <p className="p-6 text-sm text-muted-foreground">
                            No hay eventos publicados o finalizados en ese período. Probá con otras fechas.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Evento</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="hidden text-right md:table-cell">Cupo</TableHead>
                                    <TableHead className="text-right">Inscriptos</TableHead>
                                    <TableHead className="text-right">Asistentes</TableHead>
                                    <TableHead className="text-right">% asistencia</TableHead>
                                    <TableHead className="text-right">% no show</TableHead>
                                    <TableHead className="pr-6 text-right">Puntaje</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filas.map((f) => (
                                    <TableRow key={f.id}>
                                        <TableCell className="pl-6">
                                            <Link href={`/eventos/${f.id}`} className="font-medium hover:text-primary hover:underline">
                                                {f.titulo}
                                            </Link>
                                            <div className="text-sm text-muted-foreground">{f.categoria}</div>
                                        </TableCell>
                                        <TableCell>{f.fecha}</TableCell>
                                        <TableCell className="hidden text-right tabular-nums md:table-cell">{f.cupo}</TableCell>
                                        <TableCell className="text-right tabular-nums">{f.inscriptos}</TableCell>
                                        <TableCell className="text-right tabular-nums">{f.asistentes}</TableCell>
                                        <TableCell className="text-right tabular-nums">{porcentaje(f.porcentaje)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{porcentaje(f.no_show)}</TableCell>
                                        <TableCell className="pr-6 text-right tabular-nums">{f.puntaje ?? '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell className="pl-6 font-semibold" colSpan={2}>
                                        Total ({totales.eventos} {totales.eventos === 1 ? 'evento' : 'eventos'})
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell" />
                                    <TableCell className="text-right font-semibold tabular-nums">{totales.inscriptos}</TableCell>
                                    <TableCell className="text-right font-semibold tabular-nums">{totales.asistentes}</TableCell>
                                    <TableCell className="text-right font-semibold tabular-nums">{porcentaje(totales.porcentaje)}</TableCell>
                                    <TableCell className="text-right font-semibold tabular-nums">{porcentaje(totales.no_show)}</TableCell>
                                    <TableCell className="pr-6 text-right font-semibold tabular-nums">{totales.puntaje ?? '-'}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    )}
                </Card>

                <p className="text-sm text-muted-foreground">
                    El % de asistencia se calcula sobre los inscriptos confirmados y solo para eventos que ya terminaron; el % de no show, solo para los finalizados. No incluye borradores
                    ni eventos cancelados.
                </p>
            </div>
        </>
    );
}
