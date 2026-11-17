import { useForm } from '@inertiajs/react';
import { Ban } from 'lucide-react';
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

export default function CancelarEventoDialog({ eventoId, inscriptos }: { eventoId: number; inscriptos: number }) {
    const [abierto, setAbierto] = useState(false);
    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({ motivo: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(`/eventos/${eventoId}/cancelar`, {
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
                <Button variant="outline" size="sm">
                    <Ban />
                    Cancelar evento
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Cancelar evento</DialogTitle>
                        <DialogDescription>
                            El evento no se borra: queda como cancelado y nadie más se puede inscribir.
                            {inscriptos > 0 && ` Los ${inscriptos} inscriptos van a ver el motivo.`}
                        </DialogDescription>
                    </DialogHeader>

                    <FormField label="Motivo" htmlFor="motivo" error={errors.motivo}>
                        <Textarea
                            id="motivo"
                            rows={4}
                            value={data.motivo}
                            onChange={(e) => setData('motivo', e.target.value)}
                            placeholder="Por ejemplo: el disertante no puede asistir."
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
                            {processing ? 'Cancelando...' : 'Cancelar evento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
