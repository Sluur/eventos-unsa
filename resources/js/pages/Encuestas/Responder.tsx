import { Head, useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import CategoriaEtiqueta from '@/components/categoria-etiqueta';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { capitalizar, formatearFechaLarga } from '@/lib/fechas';
import { cn } from '@/lib/utils';

interface Props {
    evento: {
        id: number;
        titulo: string;
        fecha_inicio: string;
        categoria: { id: number; nombre: string; color: string | null };
        lugar: { id: number; nombre: string };
    };
    nombre: string;
    respondida: boolean;
    urlGuardar: string;
    urlCertificado?: string;
}

const textos = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

export default function Responder({ evento, nombre, respondida, urlGuardar, urlCertificado }: Props) {
    const { data, setData, post, processing, errors } = useForm({ puntaje: 0, comentario: '' });
    const [resaltado, setResaltado] = useState(0);
    const mostrado = resaltado || data.puntaje;

    const enviar = (e: FormEvent) => {
        e.preventDefault();
        post(urlGuardar, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Encuesta de satisfacción" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:py-10">
                <div className="flex flex-col gap-1">
                    <CategoriaEtiqueta nombre={evento.categoria.nombre} color={evento.categoria.color} className="text-sm" />
                    <h1 className="text-2xl font-bold">{evento.titulo}</h1>
                    <p className="text-muted-foreground">
                        {capitalizar(formatearFechaLarga(evento.fecha_inicio))}, {evento.lugar.nombre}
                    </p>
                </div>

                <Card>
                    <CardContent className="flex flex-col gap-5">
                        {respondida ? (
                            <>
                                <div>
                                    <h2 className="text-lg font-semibold">¡Gracias, {nombre}!</h2>
                                    <p className="text-muted-foreground">
                                        Tu respuesta nos ayuda a mejorar las próximas actividades.
                                    </p>
                                </div>
                                {urlCertificado && (
                                    <Button asChild className="w-fit">
                                        <a href={urlCertificado}>Descargar certificado</a>
                                    </Button>
                                )}
                            </>
                        ) : (
                            <form onSubmit={enviar} className="flex flex-col gap-5">
                                <div>
                                    <h2 className="text-lg font-semibold">Encuesta de satisfacción</h2>
                                    <p className="text-muted-foreground">
                                        Respondela para descargar tu certificado de asistencia. Son dos preguntas.
                                    </p>
                                </div>

                                <fieldset className="flex flex-col gap-2">
                                    <legend className="mb-2 text-sm font-medium">¿Cómo calificás el evento?</legend>
                                    <div className="flex items-center gap-3">
                                        <div className="flex" onMouseLeave={() => setResaltado(0)}>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setData('puntaje', n)}
                                                    onMouseEnter={() => setResaltado(n)}
                                                    aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                                                    aria-pressed={data.puntaje === n}
                                                    className="rounded p-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                                >
                                                    <Star
                                                        className={cn(
                                                            'size-8',
                                                            n <= mostrado ? 'fill-acento text-acento' : 'text-muted-foreground',
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">{textos[mostrado]}</span>
                                    </div>
                                    <InputError message={errors.puntaje} />
                                </fieldset>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="comentario">Comentario (opcional)</Label>
                                    <Textarea
                                        id="comentario"
                                        rows={4}
                                        maxLength={500}
                                        value={data.comentario}
                                        onChange={(e) => setData('comentario', e.target.value)}
                                        placeholder="Qué te gustó, qué cambiarías..."
                                    />
                                    <span className="text-sm text-muted-foreground">{data.comentario.length} de 500</span>
                                    <InputError message={errors.comentario} />
                                </div>

                                <Button type="submit" disabled={processing} className="w-fit">
                                    {processing ? 'Enviando...' : 'Enviar respuesta'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
