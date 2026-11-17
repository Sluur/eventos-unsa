import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Props {
    inscriptos: number;
    cupo: number;
    className?: string;
}

export default function CupoBar({ inscriptos, cupo, className }: Props) {
    const porcentaje = cupo > 0 ? Math.min(100, Math.round((inscriptos / cupo) * 100)) : 0;

    return (
        <Progress
            value={porcentaje}
            className={cn(porcentaje >= 100 && '[&>[data-slot=progress-indicator]]:bg-red-500', className)}
        />
    );
}
