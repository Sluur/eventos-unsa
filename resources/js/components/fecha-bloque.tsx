import { diaDelMes, mesCorto } from '@/lib/fechas';
import { cn } from '@/lib/utils';

// Fecha en bloque tipo calendario: día grande y mes abajo
export default function FechaBloque({ fecha, grande = false }: { fecha: string; grande?: boolean }) {
    return (
        <div
            className={cn(
                'flex shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary',
                grande ? 'size-20' : 'size-14',
            )}
        >
            <span className={cn('leading-none font-bold', grande ? 'text-3xl' : 'text-xl')}>
                {diaDelMes(fecha)}
            </span>
            <span className={cn('mt-1 font-medium uppercase', grande ? 'text-sm' : 'text-xs')}>
                {mesCorto(fecha)}
            </span>
        </div>
    );
}
