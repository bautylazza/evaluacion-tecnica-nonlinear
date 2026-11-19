import type { Producto } from '../types/Producto';

type Props = {
  productos: Producto[];
};

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function TablaProductos({ productos }: Props) {
  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th className="numero">Precio unitario</th>
          <th className="numero">Stock actual</th>
          <th className="numero">Stock mínimo</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => (
          <tr key={producto.id}>
            <td>{producto.nombre}</td>
            <td>{producto.categoriaNombre}</td>
            <td className="numero">{formatoPrecio.format(producto.precioUnitario)}</td>
            <td className="numero">
              {producto.stockBajo && <span className="etiqueta-stock-bajo">Stock bajo</span>}
              {producto.stockActual}
            </td>
            <td className="numero">{producto.stockMinimo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
