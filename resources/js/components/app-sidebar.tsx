
import { BookOpen, CalendarDays, FolderGit2, LayoutGrid, MapPin, Tags } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Link, usePage } from '@inertiajs/react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const navConPermiso: { item: NavItem; permiso: string }[] = [
    { item: { title: 'Eventos', href: '/eventos', icon: CalendarDays }, permiso: 'listar eventos' },
    { item: { title: 'Categorías', href: '/categorias', icon: Tags }, permiso: 'gestionar categorias' },
    { item: { title: 'Lugares', href: '/lugares', icon: MapPin }, permiso: 'gestionar lugares' },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const permisos = (usePage().props as { permisos?: string[] }).permisos ?? [];

    const itemsVisibles = [
        ...mainNavItems,
        ...navConPermiso
            .filter((n) => permisos.includes(n.permiso))
            .map((n) => n.item),
    ];

    
    return (

        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={itemsVisibles} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
