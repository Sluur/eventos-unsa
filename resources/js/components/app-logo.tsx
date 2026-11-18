import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Props {
    claro?: boolean;
    conNombre?: boolean;
    nombreEnCelular?: boolean;
    className?: string;
}

export default function AppLogo({ claro = false, conNombre = true, nombreEnCelular = true, className }: Props) {
    const { name, logo } = usePage().props;

    return (
        <span className={cn('flex items-center gap-2', className)}>
            {logo ? (
                <img src={logo} alt="Exactas · UNSa" className="h-9 w-auto" />
            ) : (
                <span
                    className={cn(
                        'rounded-md px-2 py-1 text-xs font-bold whitespace-nowrap',
                        claro ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
                    )}
                >
                    Exactas · UNSa
                </span>
            )}
            {conNombre && (
                <span className={cn('truncate font-semibold', !nombreEnCelular && 'hidden sm:inline')}>{name}</span>
            )}
        </span>
    );
}
