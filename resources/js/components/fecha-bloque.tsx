import { diaDelMes, mesCorto } from '@/lib/fechas';
import { cn } from '@/lib/utils';

export default function FechaBloque({ fecha, grande = false }: { fecha: string; grande?: boolean }) {
    return (
        <div
            className={cn(
                'flex shrink-0 flex-col overflow-hidden rounded-md border bg-card text-center',
                grande ? 'w-20' : 'w-14',
            )}
        >
            <span
                className={cn(
                    'bg-primary font-medium text-primary-foreground',
                    grande ? 'py-1 text-sm' : 'py-0.5 text-xs',
                )}
            >
                {mesCorto(fecha)}
            </span>
            <span
                className={cn(
                    'font-semibold leading-none tabular-nums',
                    grande ? 'py-3 text-4xl' : 'py-2 text-2xl',
                )}
            >
                {diaDelMes(fecha)}
            </span>
        </div>
    );
}
