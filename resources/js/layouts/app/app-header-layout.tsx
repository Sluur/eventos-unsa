import { AppHeader } from '@/components/app-header';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col">
                {children}
            </main>
        </div>
    );
}
