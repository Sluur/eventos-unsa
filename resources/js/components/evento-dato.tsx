import type { ReactNode } from 'react';

export default function EventoDato({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{titulo}</span>
            {children}
        </div>
    );
}
