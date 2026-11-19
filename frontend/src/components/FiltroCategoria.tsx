import type { ChangeEvent } from 'react';
import type { Producto } from '../types/Producto';

type Categoria = {
  id: number;
  nombre: string;
};

type Props = {
  productos: Producto[];
  categoriaId: number | null;
  onCambiar: (categoriaId: number | null) => void;
};

function obtenerCategorias(productos: Producto[]): Categoria[] {
  const nombresPorId = new Map<number, string>();
  for (const producto of productos) {
    nombresPorId.set(producto.categoriaId, producto.categoriaNombre);
  }
  const categorias = Array.from(nombresPorId, ([id, nombre]) => ({ id, nombre }));
  return categorias.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function FiltroCategoria({ productos, categoriaId, onCambiar }: Props) {
  const categorias = obtenerCategorias(productos);

  function manejarCambio(evento: ChangeEvent<HTMLSelectElement>) {
    const valor = evento.target.value;
    onCambiar(valor === '' ? null : Number(valor));
  }

  return (
    <label className="filtro">
      Categoría
      <select value={categoriaId ?? ''} onChange={manejarCambio}>
        <option value="">Todas</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
