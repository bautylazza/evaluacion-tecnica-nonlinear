export type Producto = {
  id: number;
  nombre: string;
  categoriaId: number;
  categoriaNombre: string;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
};
