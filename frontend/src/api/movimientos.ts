import type { MovimientoRequest } from '../types/Movimiento';
import { crearErrorApi } from './errores';

export async function registrarMovimiento(movimiento: MovimientoRequest): Promise<void> {
  const respuesta = await fetch('/movimientos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movimiento),
  });
  if (!respuesta.ok) {
    throw await crearErrorApi(respuesta);
  }
}
