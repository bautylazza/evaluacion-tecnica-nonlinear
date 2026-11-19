export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export type MovimientoRequest = {
  productoId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
  usuario: string;
};
