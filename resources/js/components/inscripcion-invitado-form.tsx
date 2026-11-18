import { useForm, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import ArchivoInput from '@/components/archivo-input';
import FormField from '@/components/form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
    eventoId: number;
    documentacion: string | null;
}

export default function InscripcionInvitadoForm({ eventoId, documentacion }: Props) {
    const flash = (usePage().props as { flash?: { success?: string | null } }).flash;
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm<{
        nombre: string;
        apellido: string;
        email: string;
        dni: string;
        archivo: File | null;
    }>({ nombre: '', apellido: '', email: '', dni: '', archivo: null });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/cartelera/${eventoId}/inscripcion`, {
            preserveScroll: true,
            forceFormData: documentacion !== null,
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            {wasSuccessful && flash?.success && (
                <Alert>
                    <CircleCheck />
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            )}

            <p className="text-sm text-muted-foreground">Inscribite sin crear una cuenta.</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <FormField label="Nombre" htmlFor="nombre" error={errors.nombre}>
                    <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} aria-invalid={!!errors.nombre} />
                </FormField>
                <FormField label="Apellido" htmlFor="apellido" error={errors.apellido}>
                    <Input id="apellido" value={data.apellido} onChange={(e) => setData('apellido', e.target.value)} aria-invalid={!!errors.apellido} />
                </FormField>
            </div>

            <FormField label="Email" htmlFor="email" error={errors.email}>
                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} aria-invalid={!!errors.email} />
            </FormField>

            <FormField label="DNI" htmlFor="dni" error={errors.dni} ayuda="Sin puntos.">
                <Input
                    id="dni"
                    inputMode="numeric"
                    value={data.dni}
                    onChange={(e) => setData('dni', e.target.value)}
                    aria-invalid={!!errors.dni}
                />
            </FormField>

            {documentacion && (
                <FormField label={`Subí: ${documentacion}`} htmlFor="archivo" error={errors.archivo} ayuda="PDF, JPG o PNG de hasta 5 MB.">
                    <ArchivoInput
                        id="archivo"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(archivo) => setData('archivo', archivo)}
                        invalido={!!errors.archivo}
                    />
                </FormField>
            )}

            <Button type="submit" disabled={processing}>
                {processing ? 'Enviando...' : 'Inscribirme como invitado'}
            </Button>
        </form>
    );
}
