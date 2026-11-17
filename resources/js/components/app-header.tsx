import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useMenu } from '@/hooks/use-menu';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const items = useMenu();

    // "Inicio" es la cartelera, fuera del panel: nunca queda marcado
    const estaActivo = (href: NavItem['href']) => href !== '/' && isCurrentOrParentUrl(href);

    return (
        <>
            <header className="sticky top-0 z-30 border-b bg-card">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
                    {/* Menú en celular */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center">
                                        <AppLogo />
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-1 px-4">
                                    {items.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent',
                                                estaActivo(item.href) &&
                                                    'bg-primary/10 text-primary',
                                            )}
                                        >
                                            {item.icon && <item.icon className="size-4" />}
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/" className="flex items-center">
                        <AppLogo />
                    </Link>

                    <nav className="ml-6 hidden h-16 items-stretch gap-1 md:flex">
                        {items.map((item) => {
                            const activo = estaActivo(item.href);

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={cn(
                                        'relative flex items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                                        activo && 'text-foreground',
                                    )}
                                >
                                    {item.title}
                                    {activo && (
                                        <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                        <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && <UserMenuContent user={auth.user} />}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
            {breadcrumbs.length > 1 && (
                <div className="border-b">
                    <div className="mx-auto flex h-11 max-w-6xl items-center px-4 text-muted-foreground">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
