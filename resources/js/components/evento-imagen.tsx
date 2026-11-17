import { cn } from '@/lib/utils';

interface Props {
    url: string | null;
    categoria: string;
    color?: string | null;
    alt: string;
    className?: string;
}

// Imagen del evento o, si no tiene, un fondo plano con un tono suave de la categoría
export default function EventoImagen({ url, categoria, color, alt, className }: Props) {
    if (url) {
        return <img src={url} alt={alt} className={cn('object-cover', className)} />;
    }

    return (
        <div
            className={cn('flex items-end bg-muted p-4', className)}
            style={color ? { backgroundColor: `color-mix(in srgb, ${color} 14%, var(--card))` } : undefined}
        >
            <span
                className="text-sm font-medium text-muted-foreground"
                style={color ? { color: `color-mix(in srgb, ${color} 70%, var(--foreground))` } : undefined}
            >
                {categoria}
            </span>
        </div>
    );
}
