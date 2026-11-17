import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import FormField from '@/components/form-field';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function RechazarInscripcionDialog({ inscripcionId, nombre }: { inscripcionId: number; nombre: string }) {
    const [abierto, setAbierto] = useState(false);
    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({ motivo: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(`/inscripciones/${inscripcionId}/rechazar`, {
            preserveScroll: true,
            onSuccess: () => {
                setAbierto(false);
                reset();
            },
        });
    };

    return (
        <Dialog
            open={abierto}
            onOpenChange={(valor) => {
                setAbierto(valor);
                if (!valor) clearErrors();
            }}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                    <X />
                    Rechazar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Rechazar inscripción</DialogTitle>
                        <DialogDescription>
                            {nombre} va a ver el motivo y puede volver a inscribirse.
                        </DialogDescription>
                    </DialogHeader>

                    <FormField label="Motivo" htmlFor={`motivo-${inscripcionId}`} error={errors.motivo}>
                        <Textarea
                            id={`motivo-${inscripcionId}`}
                            rows={3}
                            value={data.motivo}
                            onChange={(e) => setData('motivo', e.target.value)}
                            placeholder="Por ejemplo: el certificado está vencido."
                            aria-invalid={!!errors.motivo}
                        />
                    </FormField>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Volver
                            </Button>
                        </DialogClose>
                        <Button type="submit" variant="destructive" disabled={processing}>
                            Rechazar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
