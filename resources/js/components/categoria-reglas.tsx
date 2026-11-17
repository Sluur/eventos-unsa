import { FileText, UserCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReglasCategoria {
    requiere_aprobacion: boolean;
    requiere_documentacion: boolean;
    documentacion_descripcion: string | null;
}

export default function CategoriaReglas({ categoria, className }: { categoria: ReglasCategoria; className?: string }) {
    const items = [];

    if (!categoria.requiere_aprobacion) {
        items.push({ icono: Zap, texto: 'Inscripción directa' });
    } else {
        items.push({ icono: UserCheck, texto: 'El organizador aprueba cada inscripción' });
    }

    if (categoria.requiere_documentacion) {
        items.push({
            icono: FileText,
            texto: `Hay que presentar: ${categoria.documentacion_descripcion ?? 'documentación'}`,
        });
    }

    return (
        <ul className={cn('flex flex-col gap-1 text-xs text-muted-foreground', className)}>
            {items.map(({ icono: Icono, texto }) => (
                <li key={texto} className="flex items-center gap-1.5">
                    <Icono className="size-3.5 shrink-0" />
                    {texto}
                </li>
            ))}
        </ul>
    );
}
