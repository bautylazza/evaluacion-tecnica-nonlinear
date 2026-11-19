import type { Producto } from '../types/Producto';
import { crearErrorApi } from './errores';

export async function obtenerProductos(categoriaId: number | null): Promise<Producto[]> {
  const url = categoriaId === null ? '/productos' : `/productos?categoria=${categoriaId}`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw await crearErrorApi(respuesta);
  }
  return respuesta.json();
}
