import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';

type Flash = { success?: string | null; error?: string | null };

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    // Mensajes flash del backend como toasts, en un solo lugar
    useEffect(() => {
        return router.on('success', (event) => {
            const flash = event.detail.page.props.flash as Flash | undefined;

            if (flash?.success) toast.success(flash.success);
            if (flash?.error) toast.error(flash.error);
        });
    }, []);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
