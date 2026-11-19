import type { Producto } from '../types/Producto';

export async function obtenerProductos(categoriaId: number | null): Promise<Producto[]> {
  const url = categoriaId === null ? '/productos' : `/productos?categoria=${categoriaId}`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error al obtener los productos: ${respuesta.status}`);
  }
  return respuesta.json();
}
