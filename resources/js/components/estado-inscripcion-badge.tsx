import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type EstadoInscripcion = 'pendiente' | 'confirmada' | 'rechazada' | 'cancelada';

const estilos: Record<EstadoInscripcion, string> = {
    pendiente: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    confirmada: 'bg-primary/15 text-primary',
    rechazada: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
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
        <Badge variant="outline" className={cn('rounded-full border-transparent', estilos[estado], className)}>
            {textos[estado]}
        </Badge>
    );
}
