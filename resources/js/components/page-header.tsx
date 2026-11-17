import type { ReactNode } from 'react';

interface Props {
    titulo: string;
    descripcion?: string;
    children?: ReactNode;
}

export default function PageHeader({ titulo, descripcion, children }: Props) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{titulo}</h1>
                {descripcion && <p className="mt-1 text-muted-foreground">{descripcion}</p>}
            </div>
            {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
    );
}
