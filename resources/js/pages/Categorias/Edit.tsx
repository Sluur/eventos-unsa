import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
}

interface Props {
    categoria: Categoria;
}

export default function Edit({ categoria }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/categorias/${categoria.id}`);
    };

    return (
        <div>
            <h1>Editar categoría</h1>

            <form onSubmit={submit}>
                <div>
                    <label>Nombre</label>
                    <input
                        type="text"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                    />
                    {errors.nombre && <div>{errors.nombre}</div>}
                </div>

                <div>
                    <label>Descripción</label>
                    <textarea
                        value={data.descripcion}
                        onChange={(e) => setData('descripcion', e.target.value)}
                    />
                    {errors.descripcion && <div>{errors.descripcion}</div>}
                </div>

                <button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : 'Actualizar'}
                </button>
            </form>

            <Link href="/categorias">Volver</Link>
        </div>
    );
}