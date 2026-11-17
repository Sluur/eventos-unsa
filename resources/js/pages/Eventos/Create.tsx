import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import DisertantesSelect, { type DisertanteOpcion } from '@/components/disertantes-select';
import FormField from '@/components/form-field';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

interface Lugar {
    id: number;
    nombre: string;
    capacidad: number;
}

interface Props {
    lugares: Lugar[];
    disertantes: DisertanteOpcion[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Eventos', href: '/eventos' },
    { title: 'Nueva charla', href: '/eventos/create' },
];

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

    const lugarElegido = lugares.find((l) => String(l.id) === data.lugar_id);

    const guardar = (estado: 'borrador' | 'publicado') => (e: FormEvent) => {
        e.preventDefault();
        transform((datos) => ({ ...datos, estado }));
        post('/eventos');
    };

    setLayoutProps({ breadcrumbs });

    return (
        <>
            <Head title="Nueva charla" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-10">
                <PageHeader
                    titulo="Nueva charla"
                    descripcion="Podés guardarla como borrador y publicarla más adelante."
                />

                <Card>
                    <CardContent>
                        <form onSubmit={guardar('publicado')} className="flex flex-col gap-5">
                            <FormField label="Título" htmlFor="titulo" error={errors.titulo}>
                                <Input
                                    id="titulo"
                                    value={data.titulo}
                                    onChange={(e) => setData('titulo', e.target.value)}
                                    aria-invalid={!!errors.titulo}
                                />
                            </FormField>

                            <FormField label="Descripción" htmlFor="descripcion" error={errors.descripcion}>
                                <Textarea
                                    id="descripcion"
                                    rows={4}
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    aria-invalid={!!errors.descripcion}
                                />
                            </FormField>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="Inicio" htmlFor="fecha_inicio" error={errors.fecha_inicio}>
                                    <Input
                                        id="fecha_inicio"
                                        type="datetime-local"
                                        value={data.fecha_inicio}
                                        onChange={(e) => setData('fecha_inicio', e.target.value)}
                                        aria-invalid={!!errors.fecha_inicio}
                                    />
                                </FormField>

                                <FormField label="Fin" htmlFor="fecha_fin" error={errors.fecha_fin}>
                                    <Input
                                        id="fecha_fin"
                                        type="datetime-local"
                                        value={data.fecha_fin}
                                        onChange={(e) => setData('fecha_fin', e.target.value)}
                                        aria-invalid={!!errors.fecha_fin}
                                    />
                                </FormField>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="Lugar" htmlFor="lugar_id" error={errors.lugar_id}>
                                    <Select value={data.lugar_id} onValueChange={(v) => setData('lugar_id', v)}>
                                        <SelectTrigger id="lugar_id" className="w-full" aria-invalid={!!errors.lugar_id}>
                                            <SelectValue placeholder="Elegí un lugar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {lugares.map((l) => (
                                                <SelectItem key={l.id} value={String(l.id)}>
                                                    {l.nombre} (capacidad {l.capacidad})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <FormField
                                    label="Cupo"
                                    htmlFor="cupo"
                                    error={errors.cupo}
                                    ayuda={lugarElegido && `Máximo ${lugarElegido.capacidad} personas en este lugar.`}
                                >
                                    <Input
                                        id="cupo"
                                        type="number"
                                        min={1}
                                        max={lugarElegido?.capacidad}
                                        value={data.cupo}
                                        onChange={(e) => setData('cupo', e.target.value)}
                                        aria-invalid={!!errors.cupo}
                                    />
                                </FormField>
                            </div>

                            <FormField label="Disertantes" htmlFor="disertantes" error={errors.disertantes}>
                                <DisertantesSelect
                                    id="disertantes"
                                    disertantes={disertantes}
                                    value={data.disertantes}
                                    onChange={(ids) => setData('disertantes', ids)}
                                    invalido={!!errors.disertantes}
                                />
                            </FormField>

                            <div className="flex flex-wrap gap-2 border-t pt-5">
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
                                <Button variant="ghost" asChild>
                                    <Link href="/eventos">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
