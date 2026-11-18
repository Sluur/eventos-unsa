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
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
                    <Link href="/" className="flex min-w-0 items-center">
                        <AppLogo className="min-w-0" nombreEnCelular={false} />
                    </Link>

                    <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login">Ingresar</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/register">Registrarse</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1">{children}</main>

            <footer className="border-t bg-card">
                <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm sm:grid-cols-2 sm:px-6">
                    <div>
                        <p className="font-semibold">Facultad de Ciencias Exactas</p>
                        <p className="text-muted-foreground">Universidad Nacional de Salta</p>
                    </div>
                    <div className="text-muted-foreground sm:text-right">
                        <p>Av. Bolivia 5150, A4408FVY Salta, Argentina</p>
                        <p>eventos.exactas@gmail.com</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
