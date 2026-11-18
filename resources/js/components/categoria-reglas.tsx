import { cn } from '@/lib/utils';

export interface ReglasCategoria {
    requiere_aprobacion: boolean;
    requiere_documentacion: boolean;
    documentacion_descripcion: string | null;
}

export default function CategoriaReglas({ categoria, className }: { categoria: ReglasCategoria; className?: string }) {
    return (
        <ul className={cn('flex flex-col gap-0.5 text-sm text-muted-foreground', className)}>
            <li>{categoria.requiere_aprobacion ? 'El organizador aprueba cada inscripción.' : 'Inscripción directa, sin aprobación.'}</li>
            {categoria.requiere_documentacion && (
                <li>Hay que presentar: {categoria.documentacion_descripcion ?? 'documentación'}.</li>
            )}
        </ul>
    );
}
