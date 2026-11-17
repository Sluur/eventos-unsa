import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Flash = { success?: string | null; error?: string | null };

// Muestra los mensajes flash del backend como toasts
export function useFlashToasts(): void {
    useEffect(() => {
        return router.on('success', (event) => {
            const flash = event.detail.page.props.flash as Flash | undefined;

            if (flash?.success) toast.success(flash.success);
            if (flash?.error) toast.error(flash.error);
        });
    }, []);
}
