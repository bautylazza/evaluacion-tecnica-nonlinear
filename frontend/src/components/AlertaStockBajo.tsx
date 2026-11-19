import type { Producto } from '../types/Producto';

type Props = {
  productos: Producto[];
};

function unidadesFaltantes(producto: Producto): number {
  return producto.stockMinimo - producto.stockActual;
}

export function AlertaStockBajo({ productos }: Props) {
  const productosConStockBajo = productos.filter((producto) => producto.stockBajo);
  if (productosConStockBajo.length === 0) {
    return null;
  }
  productosConStockBajo.sort((a, b) => unidadesFaltantes(b) - unidadesFaltantes(a));
  const titulo = productosConStockBajo.length === 1
    ? '1 producto con stock bajo'
    : `${productosConStockBajo.length} productos con stock bajo`;

  return (
    <section className="alerta">
      <h2>{titulo}</h2>
      <ul>
        {productosConStockBajo.map((producto) => (
          <li key={producto.id}>
            <span className="alerta-nombre">{producto.nombre}</span>
            <span>Stock {producto.stockActual} · mínimo {producto.stockMinimo}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
