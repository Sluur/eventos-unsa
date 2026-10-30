import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        descripcion: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/categorias');
    };

    return (
        <div>
            <h1>Nueva categoría</h1>

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
                    {processing ? 'Guardando...' : 'Guardar'}
                </button>
            </form>

            <Link href="/categorias">Volver</Link>
        </div>
    );
}