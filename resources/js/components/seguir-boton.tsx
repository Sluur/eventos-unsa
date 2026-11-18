import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    url: string;
    siguiendo: boolean;
    texto?: string;
}

export default function SeguirBoton({ url, siguiendo, texto = 'Seguir' }: Props) {
    const [enviando, setEnviando] = useState(false);

    const opciones = {
        preserveScroll: true,
        onStart: () => setEnviando(true),
        onFinish: () => setEnviando(false),
    };

    const alternar = () => (siguiendo ? router.delete(url, opciones) : router.post(url, {}, opciones));

    return (
        <Button variant={siguiendo ? 'secondary' : 'outline'} size="sm" onClick={alternar} disabled={enviando}>
            {siguiendo ? 'Dejar de seguir' : texto}
        </Button>
    );
}
