import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
    icono: LucideIcon;
    titulo: string;
    descripcion?: string;
    children?: ReactNode;
}

export default function EmptyState({ icono: Icono, titulo, descripcion, children }: Props) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icono className="size-6" />
            </div>
            <p className="font-medium">{titulo}</p>
            {descripcion && <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
            {children && <div className="mt-2">{children}</div>}
        </div>
    );
}
