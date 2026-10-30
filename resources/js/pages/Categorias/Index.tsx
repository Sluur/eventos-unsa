import { Link, router } from '@inertiajs/react';

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
}

interface Props {
    categorias: Categoria[];
    flash?: {
        success?: string;
    };
}

export default function Index({ categorias, flash }: Props) {
    const eliminar = (id: number) => {
        if (confirm('¿Seguro que querés eliminar esta categoría?')) {
            router.delete(`/categorias/${id}`);
        }
    };
    return (
        <div>
            <h1>Categorías</h1>

            {flash?.success && <div>{flash.success}</div>}

            <Link href="/categorias/create">Nueva categoría</Link>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((categoria) => (
                        <tr key={categoria.id}>
                            <td>{categoria.nombre}</td>
                            <td>{categoria.descripcion ?? '-'}</td>
                            <td>
                        <Link href={`/categorias/${categoria.id}/edit`}>Editar</Link>
                        {' | '}
                        <button type="button" onClick={() => eliminar(categoria.id)}>
                            Eliminar
                        </button>
                    </td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </div>
    );
}