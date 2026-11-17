import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type EstadoEvento = 'borrador' | 'publicado' | 'cancelado' | 'finalizado';

const estilos: Record<EstadoEvento, string> = {
    borrador: 'border-transparent bg-muted text-muted-foreground',
    publicado: 'border-transparent bg-primary/15 text-primary',
    cancelado: 'border-transparent bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    finalizado: 'border-transparent bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

const textos: Record<EstadoEvento, string> = {
    borrador: 'Borrador',
    publicado: 'Publicado',
    cancelado: 'Cancelado',
    finalizado: 'Finalizado',
};

export default function EstadoBadge({ estado, className }: { estado: EstadoEvento; className?: string }) {
    return (
        <Badge variant="outline" className={cn('rounded-full', estilos[estado], className)}>
            {textos[estado]}
        </Badge>
    );
}
