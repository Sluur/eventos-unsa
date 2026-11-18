import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    id: string;
    accept: string;
    onChange: (archivo: File | null) => void;
    invalido?: boolean;
}

export default function ArchivoInput({ id, accept, onChange, invalido = false }: Props) {
    const [nombre, setNombre] = useState('');

    return (
        <div
            className={cn(
                'flex h-9 items-center gap-3 rounded-md border bg-card pr-3 text-sm focus-within:ring-2 focus-within:ring-ring',
                invalido && 'border-destructive',
            )}
        >
            <label
                htmlFor={id}
                className="flex h-full shrink-0 cursor-pointer items-center rounded-l-md border-r bg-muted px-3 font-medium hover:bg-accent"
            >
                Elegir archivo
            </label>
            <span className={cn('truncate', !nombre && 'text-muted-foreground')}>
                {nombre || 'Ningún archivo elegido'}
            </span>
            <input
                id={id}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(e) => {
                    const archivo = e.target.files?.[0] ?? null;
                    setNombre(archivo?.name ?? '');
                    onChange(archivo);
                }}
            />
        </div>
    );
}
