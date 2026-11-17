import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type EstadoEvento = 'borrador' | 'publicado' | 'cancelado' | 'finalizado';

const estilos: Record<EstadoEvento, string> = {
    borrador: 'bg-muted text-muted-foreground',
    publicado: 'bg-primary/10 text-primary',
    cancelado: 'bg-destructive/10 text-destructive',
    finalizado: 'bg-chart-5/10 text-chart-5',
};

const textos: Record<EstadoEvento, string> = {
    borrador: 'Borrador',
    publicado: 'Publicado',
    cancelado: 'Cancelado',
    finalizado: 'Finalizado',
};

export default function EstadoBadge({ estado, className }: { estado: EstadoEvento; className?: string }) {
    return (
        <Badge variant="outline" className={cn('border-transparent', estilos[estado], className)}>
            {textos[estado]}
        </Badge>
    );
}
