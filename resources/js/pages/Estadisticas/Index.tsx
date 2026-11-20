import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

interface Props {
    resumen: { tasa: number | null; eventos: number; inscriptos: number; asistentes: number; no_show: number };
    porCategoria: { categoria: string; color: string | null; eventos: number; inscriptos: number; no_show: number; tasa: number | null }[];
    eventos: { id: number; titulo: string; fecha: string; inscriptos: number; asistentes: number; no_show: number; tasa: number | null }[];
    alumnos: { id: number; nombre: string; email: string; faltas: number; eventos: string[] }[];
    filtros: { desde: string; hasta: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Estadísticas', href: '/estadisticas' }];

const configGrafico = {
    tasa: { label: '% no asistió', color: 'var(--primary)' },
} satisfies ChartConfig;

const porcentaje = (valor: number | null) => (valor === null ? '-' : `${valor}%`);

export default function Index({ resumen, porCategoria, eventos, alumnos, filtros }: Props) {
    setLayoutProps({ breadcrumbs });

    const visitar = (cambios: Partial<Props['filtros']>) => {
        router.get('/estadisticas', { ...filtros, ...cambios }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const tarjetas = [
        { titulo: '% que no asistió', valor: porcentaje(resumen.tasa), detalle: `${resumen.no_show} de ${resumen.inscriptos} confirmados no fueron` },
        { titulo: 'Eventos realizados', valor: resumen.eventos, detalle: 'Finalizados en el período' },
        { titulo: 'Inscriptos', valor: resumen.inscriptos, detalle: 'Confirmados en esos eventos' },
        { titulo: 'Asistentes', valor: resumen.asistentes, detalle: 'Con asistencia registrada' },
    ];

    return (
        <>
            <Head title="Estadísticas" />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader
                    titulo="Estadísticas"
                    descripcion="No asistió: inscriptos confirmados que no fueron a un evento ya finalizado."
                />

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
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {tarjetas.map((t) => (
                        <Card key={t.titulo} className="gap-1 py-4">
                            <CardContent className="flex flex-col gap-1 px-5">
                                <span className="text-sm text-muted-foreground">{t.titulo}</span>
                                <span className="text-3xl font-bold tabular-nums">{t.valor}</span>
                                <span className="text-sm text-muted-foreground">{t.detalle}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {resumen.eventos === 0 ? (
                    <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                        No hay eventos finalizados en ese período. Probá con otras fechas.
                    </p>
                ) : (
                    <>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>No asistieron, por categoría</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <ChartContainer config={configGrafico} className="aspect-auto h-56 w-full">
                                        <BarChart data={porCategoria} margin={{ left: -16 }}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="categoria" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                            <Bar dataKey="tasa" fill="var(--color-tasa)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead className="text-right">Eventos</TableHead>
                                                <TableHead className="text-right">Confirmados</TableHead>
                                                <TableHead className="text-right">No asistieron</TableHead>
                                                <TableHead className="text-right">%</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {porCategoria.map((c) => (
                                                <TableRow key={c.categoria}>
                                                    <TableCell>{c.categoria}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{c.eventos}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{c.inscriptos}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{c.no_show}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{porcentaje(c.tasa)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Eventos con más inscriptos que no asistieron</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {eventos.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">En este período todos los confirmados asistieron.</p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Evento</TableHead>
                                                    <TableHead className="text-right">No asistieron</TableHead>
                                                    <TableHead className="text-right">%</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {eventos.map((e) => (
                                                    <TableRow key={e.id}>
                                                        <TableCell>
                                                            <Link href={`/eventos/${e.id}`} className="font-medium hover:text-primary hover:underline">
                                                                {e.titulo}
                                                            </Link>
                                                            <div className="text-sm text-muted-foreground">{e.fecha}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {e.no_show} de {e.inscriptos}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">{porcentaje(e.tasa)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Alumnos con 2 o más faltas sin cancelar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {alumnos.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nadie faltó a más de un evento en este período.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Alumno</TableHead>
                                                <TableHead className="text-right">Faltas</TableHead>
                                                <TableHead className="hidden md:table-cell">Eventos</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {alumnos.map((a) => (
                                                <TableRow key={a.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{a.nombre}</div>
                                                        <div className="text-sm text-muted-foreground">{a.email}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">{a.faltas}</TableCell>
                                                    <TableCell className="hidden text-muted-foreground md:table-cell">
                                                        {a.eventos.join(', ')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </>
    );
}
