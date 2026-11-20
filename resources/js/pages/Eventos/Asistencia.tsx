import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import { Users } from 'lucide-react';
import type { FormEvent } from 'react';
import EmptyState from '@/components/empty-state';
import InputError from '@/components/input-error';
import InscriptoNombre, { emailInscripto } from '@/components/inscripto-nombre';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatearFecha } from '@/lib/fechas';
import type { BreadcrumbItem } from '@/types';

interface Evento {
    id: number;
    titulo: string;
    fecha_inicio: string;
    estado: string;
}

interface Inscripto {
    id: number;
    asistio: boolean;
    user: { id: number; name: string; email: string } | null;
    nombre_invitado: string | null;
    apellido_invitado: string | null;
    email_invitado: string | null;
}

interface Props {
    evento: Evento;
    inscriptos: Inscripto[];
}

export default function Asistencia({ evento, inscriptos }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Eventos', href: '/eventos' },
        { title: evento.titulo, href: `/eventos/${evento.id}` },
        { title: 'Asistencia', href: `/eventos/${evento.id}/asistencia` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        asistentes: inscriptos.filter((i) => i.asistio).map((i) => i.id),
    });

    const marcar = (id: number, presente: boolean) => {
        setData(
            'asistentes',
            presente ? [...data.asistentes, id] : data.asistentes.filter((a) => a !== id),
        );
    };

    const todosMarcados = inscriptos.length > 0 && data.asistentes.length === inscriptos.length;

    const marcarTodos = (valor: boolean) => {
        setData('asistentes', valor ? inscriptos.map((i) => i.id) : []);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/eventos/${evento.id}/asistencia`);
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title={`Asistencia - ${evento.titulo}`} />

            <div className="flex flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader
                    titulo="Tomar asistencia"
                    descripcion={`${evento.titulo} · ${formatearFecha(evento.fecha_inicio)}`}
                />

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <Card className="py-0">
                        {inscriptos.length === 0 ? (
                            <EmptyState icono={Users} titulo="No hay inscriptos en este evento" />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 pl-6">
                                            <Checkbox
                                                checked={todosMarcados}
                                                onCheckedChange={(v) => marcarTodos(v === true)}
                                                aria-label="Marcar todos"
                                            />
                                        </TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inscriptos.map((inscripcion) => (
                                        <TableRow
                                            key={inscripcion.id}
                                            data-state={data.asistentes.includes(inscripcion.id) ? 'selected' : undefined}
                                        >
                                            <TableCell className="pl-6">
                                                <Checkbox
                                                    id={`asistio-${inscripcion.id}`}
                                                    checked={data.asistentes.includes(inscripcion.id)}
                                                    onCheckedChange={(v) => marcar(inscripcion.id, v === true)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <label htmlFor={`asistio-${inscripcion.id}`} className="cursor-pointer">
                                                    <InscriptoNombre inscripto={inscripcion} />
                                                </label>
                                            </TableCell>
                                            <TableCell className="hidden text-muted-foreground md:table-cell">
                                                {emailInscripto(inscripcion)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Card>

                    <InputError message={errors.asistentes} />

                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="submit" disabled={processing || inscriptos.length === 0}>
                            {processing ? 'Guardando...' : 'Guardar asistencia'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/eventos/${evento.id}`}>Cancelar</Link>
                        </Button>
                        <span className="text-sm text-muted-foreground sm:ml-auto">
                            {data.asistentes.length} de {inscriptos.length} presentes
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
}
