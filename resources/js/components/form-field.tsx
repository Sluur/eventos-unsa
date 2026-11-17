import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';

interface Props {
    label: string;
    htmlFor?: string;
    error?: string;
    ayuda?: ReactNode;
    children: ReactNode;
}

// Label + campo + ayuda + error, igual en todos los formularios
export default function FormField({ label, htmlFor, error, ayuda, children }: Props) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
            <InputError message={error} />
        </div>
    );
}
