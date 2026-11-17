import { Badge } from '@/components/ui/badge';

export interface InscriptoPersona {
    user: { id: number; name: string; email: string } | null;
    nombre_invitado: string | null;
    apellido_invitado: string | null;
    email_invitado: string | null;
}

export const nombreInscripto = (i: InscriptoPersona) =>
    i.user?.name ?? `${i.nombre_invitado ?? ''} ${i.apellido_invitado ?? ''}`.trim();

export const emailInscripto = (i: InscriptoPersona) => i.user?.email ?? i.email_invitado ?? '';

export default function InscriptoNombre({ inscripto, conEmail = false }: { inscripto: InscriptoPersona; conEmail?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className="flex flex-wrap items-center gap-1.5 font-medium">
                {nombreInscripto(inscripto)}
                {!inscripto.user && (
                    <Badge variant="outline" className="px-1.5 py-0 text-[11px] font-normal text-muted-foreground">
                        Invitado
                    </Badge>
                )}
            </span>
            {conEmail && <span className="text-xs text-muted-foreground">{emailInscripto(inscripto)}</span>}
        </div>
    );
}
