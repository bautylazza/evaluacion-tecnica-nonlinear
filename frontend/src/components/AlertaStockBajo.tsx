import type { Producto } from '../types/Producto';

type Props = {
  productos: Producto[];
  onRegistrarEntrada: (productoId: number) => void;
};

function unidadesFaltantes(producto: Producto): number {
  return producto.stockMinimo - producto.stockActual;
}

export function AlertaStockBajo({ productos, onRegistrarEntrada }: Props) {
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
      <h2 className="alerta-titulo">{titulo}</h2>
      <ul className="alerta-productos">
        {productosConStockBajo.map((producto) => (
          <li key={producto.id} className="alerta-producto">
            <span className="alerta-nombre">{producto.nombre}</span>
            <div className="alerta-cifras">
              <div>
                <span className="alerta-rotulo">Stock</span>
                <span className="alerta-valor alerta-valor-stock">{producto.stockActual}</span>
              </div>
              <div>
                <span className="alerta-rotulo">Mínimo</span>
                <span className="alerta-valor">{producto.stockMinimo}</span>
              </div>
            </div>
            <button type="button" className="boton boton-secundario boton-chico" onClick={() => onRegistrarEntrada(producto.id)}>
              Registrar entrada
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
