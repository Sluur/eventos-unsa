import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

// Si la categoría no tiene color, toma uno fijo según su id
const colores = [
    'from-emerald-600 to-teal-500',
    'from-sky-600 to-cyan-500',
    'from-violet-600 to-indigo-500',
    'from-amber-500 to-orange-500',
    'from-rose-600 to-pink-500',
];

interface Props {
    url: string | null;
    categoriaId: number;
    color?: string | null;
    alt: string;
    className?: string;
}

export default function EventoImagen({ url, categoriaId, color, alt, className }: Props) {
    if (url) {
        return <img src={url} alt={alt} className={cn('object-cover', className)} />;
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center bg-gradient-to-br text-white/40',
                !color && colores[categoriaId % colores.length],
                className,
            )}
            style={color ? { backgroundImage: `linear-gradient(135deg, ${color}, ${color}99)` } : undefined}
        >
            <CalendarDays className="size-10" />
        </div>
    );
}
