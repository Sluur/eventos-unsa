import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Ícono + título chico + contenido, para los datos del detalle de un evento
export default function EventoDato({ icono: Icono, titulo, children }: { icono: LucideIcon; titulo: string; children: ReactNode }) {
    return (
        <div className="flex items-start gap-2.5">
            <Icono className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{titulo}</span>
                {children}
            </div>
        </div>
    );
}
