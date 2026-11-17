import type { InertiaFormProps } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import FormField from '@/components/form-field';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type CategoriaFormData = {
    nombre: string;
    descripcion: string;
    requiere_aprobacion: boolean;
    requiere_documentacion: boolean;
    documentacion_descripcion: string;
    color: string;
};

interface Props {
    form: InertiaFormProps<CategoriaFormData>;
    onSubmit: (e: FormEvent) => void;
    acciones: ReactNode;
}

export default function CategoriaForm({ form, onSubmit, acciones }: Props) {
    const { data, setData, errors } = form;

    // Pedir documentación implica que alguien la revise
    const cambiarDocumentacion = (valor: boolean) => {
        setData({
            ...data,
            requiere_documentacion: valor,
            requiere_aprobacion: valor ? true : data.requiere_aprobacion,
        });
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField label="Nombre" htmlFor="nombre" error={errors.nombre}>
                <Input
                    id="nombre"
                    value={data.nombre}
                    onChange={(e) => setData('nombre', e.target.value)}
                    aria-invalid={!!errors.nombre}
                />
            </FormField>

            <FormField label="Descripción" htmlFor="descripcion" error={errors.descripcion}>
                <Textarea
                    id="descripcion"
                    rows={3}
                    value={data.descripcion}
                    onChange={(e) => setData('descripcion', e.target.value)}
                    aria-invalid={!!errors.descripcion}
                />
            </FormField>

            <FormField label="Color" htmlFor="color" error={errors.color} ayuda="Se usa en las etiquetas y tarjetas de los eventos.">
                <div className="flex items-center gap-3">
                    <input
                        id="color"
                        type="color"
                        value={data.color || '#4f7f8f'}
                        onChange={(e) => setData('color', e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded-md border bg-transparent p-1"
                    />
                    <span className="font-mono text-sm text-muted-foreground">{data.color || 'Sin color'}</span>
                    {data.color && (
                        <button
                            type="button"
                            onClick={() => setData('color', '')}
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                            Quitar
                        </button>
                    )}
                </div>
            </FormField>

            <fieldset className="flex flex-col gap-4 rounded-lg border p-4">
                <legend className="px-1 text-sm font-medium">Inscripción</legend>

                <div className="flex items-start gap-3">
                    <Checkbox
                        id="requiere_aprobacion"
                        checked={data.requiere_aprobacion}
                        disabled={data.requiere_documentacion}
                        onCheckedChange={(v) => setData('requiere_aprobacion', v === true)}
                    />
                    <div className="grid gap-1">
                        <Label htmlFor="requiere_aprobacion">Requiere aprobación</Label>
                        <p className="text-xs text-muted-foreground">
                            El organizador acepta o rechaza cada inscripción.
                        </p>
                        <InputError message={errors.requiere_aprobacion} />
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Checkbox
                        id="requiere_documentacion"
                        checked={data.requiere_documentacion}
                        onCheckedChange={(v) => cambiarDocumentacion(v === true)}
                    />
                    <div className="grid gap-1">
                        <Label htmlFor="requiere_documentacion">Requiere documentación</Label>
                        <p className="text-xs text-muted-foreground">
                            El alumno sube un archivo al inscribirse. También requiere aprobación.
                        </p>
                    </div>
                </div>

                {data.requiere_documentacion && (
                    <FormField
                        label="¿Qué tiene que presentar?"
                        htmlFor="documentacion_descripcion"
                        error={errors.documentacion_descripcion}
                    >
                        <Input
                            id="documentacion_descripcion"
                            value={data.documentacion_descripcion}
                            onChange={(e) => setData('documentacion_descripcion', e.target.value)}
                            placeholder="Por ejemplo: Certificado de alumno regular"
                            aria-invalid={!!errors.documentacion_descripcion}
                        />
                    </FormField>
                )}
            </fieldset>

            <div className="flex gap-2">{acciones}</div>
        </form>
    );
}
