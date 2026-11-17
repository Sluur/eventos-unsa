import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type EstadoEvento = 'borrador' | 'publicado' | 'cancelado' | 'finalizado';

const estilos: Record<EstadoEvento, string> = {
    borrador: 'bg-muted text-muted-foreground',
    publicado: 'bg-primary/12 text-primary',
    cancelado: 'bg-destructive/12 text-destructive',
    finalizado: 'bg-[#e4ece8] text-[#48625a] dark:bg-[#1d2a26] dark:text-[#9db8ae]',
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
