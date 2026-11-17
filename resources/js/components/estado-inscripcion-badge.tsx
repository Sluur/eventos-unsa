import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type EstadoInscripcion = 'pendiente' | 'confirmada' | 'rechazada' | 'cancelada';

const estilos: Record<EstadoInscripcion, string> = {
    pendiente: 'bg-acento/12 text-acento',
    confirmada: 'bg-primary/12 text-primary',
    rechazada: 'bg-destructive/12 text-destructive',
    cancelada: 'bg-muted text-muted-foreground',
};

const textos: Record<EstadoInscripcion, string> = {
    pendiente: 'Pendiente de revisión',
    confirmada: 'Confirmada',
    rechazada: 'Rechazada',
    cancelada: 'Cancelada',
};

export default function EstadoInscripcionBadge({ estado, className }: { estado: EstadoInscripcion; className?: string }) {
    return (
        <Badge variant="outline" className={cn('border-transparent', estilos[estado], className)}>
            {textos[estado]}
        </Badge>
    );
}
