// las fechas se guardan sin zona horaria, por eso se muestran en utc

export const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-AR', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });

export const formatearFechaLarga = (fecha: string) =>
    new Date(fecha).toLocaleString('es-AR', {
        timeZone: 'UTC',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });

export const formatearHora = (fecha: string) =>
    new Date(fecha).toLocaleTimeString('es-AR', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });

export const diaDelMes = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-AR', { timeZone: 'UTC', day: '2-digit' });

export const mesCorto = (fecha: string) =>
    new Date(fecha)
        .toLocaleDateString('es-AR', { timeZone: 'UTC', month: 'short' })
        .replace('.', '');

export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
