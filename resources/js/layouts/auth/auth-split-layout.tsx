import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="grid min-h-dvh bg-background lg:grid-cols-2">
            <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
                <Link href="/" className="text-lg">
                    <AppLogo claro />
                </Link>
                <div className="max-w-md">
                    <p className="text-3xl font-bold">Eventos Exactas</p>
                    <p className="mt-3 text-primary-foreground/90">
                        Sistema de inscripción a charlas, talleres y cursos de la Facultad de Ciencias Exactas.
                    </p>
                </div>
                <p className="text-sm text-primary-foreground/90">
                    Facultad de Ciencias Exactas, Universidad Nacional de Salta
                    <br />
                    Av. Bolivia 5150, Salta
                </p>
            </div>

            <div className="flex items-center justify-center px-6 py-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Link href="/" className="flex justify-center lg:hidden">
                        <AppLogo />
                    </Link>
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="text-xl font-semibold">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
