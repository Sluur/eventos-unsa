import { useState } from 'react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface Props {
    id: string;
    accept: string;
    onChange: (archivo: File | null) => void;
    invalido?: boolean;
    maxMb: number;
}

export default function ArchivoInput({ id, accept, onChange, invalido = false, maxMb }: Props) {
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');

    return (
        <>
            <div
                className={cn(
                    'flex h-9 items-center gap-3 rounded-md border bg-card pr-3 text-sm focus-within:ring-2 focus-within:ring-ring',
                    (invalido || error) && 'border-destructive',
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

                        // si pesa de mas no se manda: el servidor lo cortaria sin mostrar el error
                        if (archivo && archivo.size > maxMb * 1024 * 1024) {
                            e.target.value = '';
                            setNombre('');
                            setError(`El archivo pesa más de ${maxMb} MB. Elegí uno más liviano.`);
                            onChange(null);

                            return;
                        }

                        setError('');
                        setNombre(archivo?.name ?? '');
                        onChange(archivo);
                    }}
                />
            </div>
            <InputError message={error} />
        </>
    );
}
