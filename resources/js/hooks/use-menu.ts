import { usePage } from '@inertiajs/react';
import { CalendarDays, House, MapPin, Mic, Tags } from 'lucide-react';
import type { NavItem } from '@/types';

const items: { item: NavItem; permiso?: string }[] = [
    { item: { title: 'Inicio', href: '/', icon: House } },
    { item: { title: 'Eventos', href: '/eventos', icon: CalendarDays }, permiso: 'listar eventos' },
    { item: { title: 'Categorías', href: '/categorias', icon: Tags }, permiso: 'gestionar categorias' },
    { item: { title: 'Lugares', href: '/lugares', icon: MapPin }, permiso: 'gestionar lugares' },
    { item: { title: 'Disertantes', href: '/disertantes', icon: Mic }, permiso: 'gestionar disertantes' },
];

// Items del menú que puede ver el usuario según sus permisos
export function useMenu(): NavItem[] {
    const permisos = (usePage().props as { permisos?: string[] }).permisos ?? [];

    return items
        .filter((i) => !i.permiso || permisos.includes(i.permiso))
        .map((i) => i.item);
}
