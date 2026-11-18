import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, MapPin, Menu, Mic, Tags } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const menu: { item: NavItem; permiso?: string }[] = [
    { item: { title: 'Eventos', href: '/eventos', icon: CalendarDays }, permiso: 'listar eventos' },
    { item: { title: 'Categorías', href: '/categorias', icon: Tags }, permiso: 'gestionar categorias' },
    { item: { title: 'Lugares', href: '/lugares', icon: MapPin }, permiso: 'gestionar lugares' },
    { item: { title: 'Disertantes', href: '/disertantes', icon: Mic }, permiso: 'gestionar disertantes' },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const permisos = (page.props as { permisos?: string[] }).permisos ?? [];
    const getInitials = useInitials();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const items = menu.filter((m) => !m.permiso || permisos.includes(m.permiso)).map((m) => m.item);

    const estaActivo = (href: NavItem['href']) => isCurrentOrParentUrl(href);

    return (
        <>
            <header className="sticky top-0 z-30 border-b bg-card">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
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

                    <Link href="/eventos" className="flex items-center">
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
