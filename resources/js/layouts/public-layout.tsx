import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { useFlashToasts } from '@/hooks/use-flash-toasts';

export default function PublicLayout({ children }: { children: ReactNode }) {
    useFlashToasts();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-30 border-b bg-card">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
                    <Link href="/" className="flex items-center">
                        <AppLogo />
                    </Link>

                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Ingresar</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">Registrarse</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1">{children}</main>

            <footer className="border-t">
                <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
                    Facultad de Ciencias Exactas · Universidad Nacional de Salta
                </div>
            </footer>
        </div>
    );
}
