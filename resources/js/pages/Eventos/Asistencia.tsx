import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Evento {
    id: number;
    titulo: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
}

interface Inscripto {
    id: number;
    asistio: boolean;
    user: { id: number; name: string; email: string };
}

interface Props {
    evento: Evento;
    inscriptos: Inscripto[];
}

const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-AR', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

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

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/eventos/${evento.id}/asistencia`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Asistencia - ${evento.titulo}`} />

            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tomar asistencia</h1>
                    <p className="text-sm text-muted-foreground">
                        {evento.titulo} · {formatearFecha(evento.fecha_inicio)}
                    </p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="w-16 px-4 py-3 font-medium">Asistió</th>
                                    <th className="px-4 py-3 font-medium">Nombre</th>
                                    <th className="hidden px-4 py-3 font-medium md:table-cell">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscriptos.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                            No hay inscriptos en este evento.
                                        </td>
                                    </tr>
                                )}
                                {inscriptos.map((inscripcion) => (
                                    <tr key={inscripcion.id} className="border-t hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <Checkbox
                                                id={`asistio-${inscripcion.id}`}
                                                checked={data.asistentes.includes(inscripcion.id)}
                                                onCheckedChange={(valor) => marcar(inscripcion.id, valor === true)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <label htmlFor={`asistio-${inscripcion.id}`} className="cursor-pointer">
                                                {inscripcion.user.name}
                                            </label>
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                            {inscripcion.user.email}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {errors.asistentes && <p className="text-sm text-red-600">{errors.asistentes}</p>}

                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="submit" disabled={processing || inscriptos.length === 0}>
                            {processing ? 'Guardando...' : 'Guardar asistencia'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/eventos/${evento.id}`}>Cancelar</Link>
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {data.asistentes.length} de {inscriptos.length} presentes
                        </span>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
