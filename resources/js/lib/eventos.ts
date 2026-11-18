import type { EstadoEvento } from '@/components/estado-badge';

export const estaAtenuado = (evento: { estado: EstadoEvento; proximo: number }) =>
    evento.estado === 'finalizado' || evento.estado === 'cancelado' || (evento.estado === 'publicado' && !evento.proximo);
