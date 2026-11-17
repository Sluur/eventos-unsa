import type { ReactNode } from 'react';

// Rótulo chico + contenido, para los datos del detalle de un evento
export default function EventoDato({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{titulo}</span>
            {children}
        </div>
    );
}
