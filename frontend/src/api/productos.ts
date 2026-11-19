import type { Producto } from '../types/Producto';

export async function obtenerProductos(categoriaId?: number): Promise<Producto[]> {
  const url = categoriaId === undefined ? '/productos' : `/productos?categoria=${categoriaId}`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error al obtener los productos: ${respuesta.status}`);
  }
  return respuesta.json();
}
