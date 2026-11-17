import type { InertiaFormProps } from '@inertiajs/react';
import { ImageIcon, X } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import CategoriaReglas, { type ReglasCategoria } from '@/components/categoria-reglas';
import DisertantesSelect, { type DisertanteOpcion } from '@/components/disertantes-select';
import FormField from '@/components/form-field';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface LugarOpcion {
    id: number;
    nombre: string;
    capacidad: number;
}

export interface CategoriaOpcion extends ReglasCategoria {
    id: number;
    nombre: string;
    color: string | null;
}

export type EventoFormData = {
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    inscripcion_hasta: string;
    categoria_id: string;
    lugar_id: string;
    cupo: string;
    solo_registrados: boolean;
    disertantes: number[];
    estado: string;
    imagen: File | null;
    quitar_imagen: boolean;
};

interface Props {
    form: InertiaFormProps<EventoFormData>;
    categorias: CategoriaOpcion[];
    lugares: LugarOpcion[];
    disertantes: DisertanteOpcion[];
    onSubmit: (e: FormEvent) => void;
    ayudaCupo?: string;
    imagenActual?: string | null;
    acciones: ReactNode;
}

export default function EventoForm({
    form,
    categorias,
    lugares,
    disertantes,
    onSubmit,
    ayudaCupo,
    imagenActual = null,
    acciones,
}: Props) {
    const { data, setData, errors } = form;
    const [preview, setPreview] = useState<string | null>(null);
    const [inputKey, setInputKey] = useState(0);

    useEffect(() => {
        if (!data.imagen) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(data.imagen);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.imagen]);

    const imagenVisible = preview ?? (data.quitar_imagen ? null : imagenActual);

    const quitarImagen = () => {
        setData({ ...data, imagen: null, quitar_imagen: true });
        setInputKey((k) => k + 1);
    };
    const lugarElegido = lugares.find((l) => String(l.id) === data.lugar_id);
    const categoriaElegida = categorias.find((c) => String(c.id) === data.categoria_id);

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

            <FormField label="Categoría" htmlFor="categoria_id" error={errors.categoria_id}>
                <Select value={data.categoria_id} onValueChange={(v) => setData('categoria_id', v)}>
                    <SelectTrigger id="categoria_id" className="w-full" aria-invalid={!!errors.categoria_id}>
                        <SelectValue placeholder="Elegí una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {categorias.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                <span
                                    className="size-2.5 rounded-full border"
                                    style={{ backgroundColor: c.color ?? 'transparent' }}
                                />
                                {c.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {categoriaElegida && <CategoriaReglas categoria={categoriaElegida} />}
            </FormField>

            <FormField
                label="Imagen (opcional)"
                htmlFor="imagen"
                error={errors.imagen}
                ayuda="JPG, PNG o WEBP de hasta 2 MB."
            >
                {imagenVisible ? (
                    <div className="relative overflow-hidden rounded-lg border">
                        <img src={imagenVisible} alt="Imagen del evento" className="h-40 w-full object-cover" />
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={quitarImagen}
                            className="absolute top-2 right-2"
                        >
                            <X />
                            Quitar
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                        <ImageIcon className="size-5 shrink-0" />
                        Sin imagen
                    </div>
                )}
                <Input
                    key={inputKey}
                    id="imagen"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setData('imagen', e.target.files?.[0] ?? null)}
                    aria-invalid={!!errors.imagen}
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

            <FormField
                label="Inscripción hasta (opcional)"
                htmlFor="inscripcion_hasta"
                error={errors.inscripcion_hasta}
                ayuda="Si la dejás vacía, se pueden inscribir hasta que empiece el evento."
            >
                <Input
                    id="inscripcion_hasta"
                    type="datetime-local"
                    value={data.inscripcion_hasta}
                    max={data.fecha_inicio || undefined}
                    onChange={(e) => setData('inscripcion_hasta', e.target.value)}
                    aria-invalid={!!errors.inscripcion_hasta}
                    className="sm:w-1/2"
                />
            </FormField>

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

            <div className="flex items-start gap-3">
                <Checkbox
                    id="solo_registrados"
                    checked={data.solo_registrados}
                    onCheckedChange={(v) => setData('solo_registrados', v === true)}
                />
                <div className="grid gap-1">
                    <Label htmlFor="solo_registrados">Solo usuarios registrados pueden inscribirse</Label>
                    <p className="text-xs text-muted-foreground">
                        Si lo destildás, el evento queda abierto al público y se pueden anotar invitados.
                    </p>
                    <InputError message={errors.solo_registrados} />
                </div>
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
