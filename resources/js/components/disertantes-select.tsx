import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DisertanteOpcion {
    id: number;
    nombre: string;
    apellido: string;
}

interface Props {
    id?: string;
    disertantes: DisertanteOpcion[];
    value: number[];
    onChange: (ids: number[]) => void;
    invalido?: boolean;
}

const nombreCompleto = (d: DisertanteOpcion) => `${d.apellido}, ${d.nombre}`;

export default function DisertantesSelect({ id, disertantes, value, onChange, invalido }: Props) {
    const [abierto, setAbierto] = useState(false);

    const seleccionados = disertantes.filter((d) => value.includes(d.id));

    const alternar = (disertanteId: number) => {
        onChange(
            value.includes(disertanteId)
                ? value.filter((v) => v !== disertanteId)
                : [...value, disertanteId],
        );
    };

    return (
        <div className="grid gap-2">
            <Popover open={abierto} onOpenChange={setAbierto}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={abierto}
                        aria-invalid={invalido}
                        className="w-full justify-between font-normal"
                    >
                        <span className="text-muted-foreground">
                            {seleccionados.length === 0
                                ? 'Buscar disertantes...'
                                : `${seleccionados.length} seleccionado${seleccionados.length === 1 ? '' : 's'}`}
                        </span>
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Escribí un nombre o apellido..." />
                        <CommandList>
                            <CommandEmpty>Sin resultados.</CommandEmpty>
                            <CommandGroup>
                                {disertantes.map((d) => (
                                    <CommandItem
                                        key={d.id}
                                        value={`${nombreCompleto(d)} ${d.id}`}
                                        onSelect={() => alternar(d.id)}
                                    >
                                        <Check
                                            className={cn(value.includes(d.id) ? 'opacity-100' : 'opacity-0')}
                                        />
                                        {nombreCompleto(d)}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {seleccionados.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {seleccionados.map((d) => (
                        <Badge key={d.id} variant="secondary" className="gap-1 py-1 pr-1 pl-2">
                            {nombreCompleto(d)}
                            <button
                                type="button"
                                onClick={() => alternar(d.id)}
                                className="rounded-sm p-0.5 hover:bg-foreground/10"
                                aria-label={`Quitar ${nombreCompleto(d)}`}
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
