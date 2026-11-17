import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
    url: string;
    titulo: string;
    descripcion?: string;
    textoBoton?: string;
    textoCancelar?: string;
    children: ReactNode;
}

export default function ConfirmDelete({
    url,
    titulo,
    descripcion = 'Esta acción no se puede deshacer.',
    textoBoton = 'Eliminar',
    textoCancelar = 'Cancelar',
    children,
}: Props) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{titulo}</AlertDialogTitle>
                    <AlertDialogDescription>{descripcion}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{textoCancelar}</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={() => router.delete(url, { preserveScroll: true })}
                    >
                        {textoBoton}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
