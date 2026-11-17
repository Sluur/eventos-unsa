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
        <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-10 text-center">
            <Icono className="mb-1 size-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="font-medium">{titulo}</p>
            {descripcion && <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
            {children && <div className="mt-2">{children}</div>}
        </div>
    );
}
