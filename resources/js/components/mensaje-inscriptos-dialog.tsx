import { useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    eventoId: number;
    confirmados: number;
    pendientes: number;
}

export default function MensajeInscriptosDialog({ eventoId, confirmados, pendientes }: Props) {
    const [abierto, setAbierto] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        asunto: '',
        cuerpo: '',
        destinatarios: 'confirmados',
    });

    const cantidades: Record<string, number> = {
        confirmados,
        pendientes,
        todos: confirmados + pendientes,
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/eventos/${eventoId}/mensajes`, {
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
                    <Mail />
                    Mensaje a inscriptos
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Mensaje a inscriptos</DialogTitle>
                        <DialogDescription>Les llega por mail. Queda guardado en el historial del evento.</DialogDescription>
                    </DialogHeader>

                    <FormField label="Para" htmlFor="destinatarios" error={errors.destinatarios}>
                        <Select value={data.destinatarios} onValueChange={(v) => setData('destinatarios', v)}>
                            <SelectTrigger id="destinatarios" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="confirmados">Confirmados ({confirmados})</SelectItem>
                                <SelectItem value="pendientes">Pendientes ({pendientes})</SelectItem>
                                <SelectItem value="todos">Todos ({confirmados + pendientes})</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Asunto" htmlFor="asunto" error={errors.asunto}>
                        <Input
                            id="asunto"
                            value={data.asunto}
                            onChange={(e) => setData('asunto', e.target.value)}
                            placeholder="Por ejemplo: Traer notebook"
                            aria-invalid={!!errors.asunto}
                        />
                    </FormField>

                    <FormField label="Mensaje" htmlFor="cuerpo" error={errors.cuerpo}>
                        <Textarea
                            id="cuerpo"
                            rows={6}
                            value={data.cuerpo}
                            onChange={(e) => setData('cuerpo', e.target.value)}
                            aria-invalid={!!errors.cuerpo}
                        />
                    </FormField>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing || cantidades[data.destinatarios] === 0}>
                            {processing ? 'Enviando...' : `Enviar a ${cantidades[data.destinatarios]}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
