import { cn } from '@/lib/utils';

interface Props {
    nombre: string;
    color: string | null;
    className?: string;
}

export default function CategoriaEtiqueta({ nombre, color, className }: Props) {
    return (
        <span className={cn('inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground', className)}>
            <span
                className="size-2 shrink-0 rounded-full bg-muted-foreground"
                style={color ? { backgroundColor: color } : undefined}
            />
            <span className="truncate">{nombre}</span>
        </span>
    );
}
