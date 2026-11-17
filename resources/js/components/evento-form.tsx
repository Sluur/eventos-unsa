import type { InertiaFormProps } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import DisertantesSelect, { type DisertanteOpcion } from '@/components/disertantes-select';
import FormField from '@/components/form-field';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface LugarOpcion {
    id: number;
    nombre: string;
    capacidad: number;
}

export type EventoFormData = {
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    lugar_id: string;
    cupo: string;
    disertantes: number[];
    estado: string;
};

interface Props {
    form: InertiaFormProps<EventoFormData>;
    lugares: LugarOpcion[];
    disertantes: DisertanteOpcion[];
    onSubmit: (e: FormEvent) => void;
    ayudaCupo?: string;
    acciones: ReactNode;
}

// Formulario compartido entre alta y edición de eventos
export default function EventoForm({ form, lugares, disertantes, onSubmit, ayudaCupo, acciones }: Props) {
    const { data, setData, errors } = form;
    const lugarElegido = lugares.find((l) => String(l.id) === data.lugar_id);

    const ayuda = [lugarElegido && `Máximo ${lugarElegido.capacidad} personas en este lugar.`, ayudaCupo]
        .filter(Boolean)
        .join(' ');

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
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

                <FormField label="Cupo" htmlFor="cupo" error={errors.cupo} ayuda={ayuda || undefined}>
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

            <InputError message={errors.estado} />

            <div className="flex flex-wrap gap-2 border-t pt-5">{acciones}</div>
        </form>
    );
}
