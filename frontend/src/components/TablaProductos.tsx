import type { Producto } from '../types/Producto';

type Props = {
  productos: Producto[];
  onRegistrarMovimiento: (productoId: number) => void;
};

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function TablaProductos({ productos, onRegistrarMovimiento }: Props) {
  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th className="numero columna-precio">Precio unitario</th>
          <th className="numero columna-stock">Stock actual</th>
          <th className="numero columna-stock">Stock mínimo</th>
          <th className="columna-estado">Estado</th>
          <th className="columna-accion"><span className="solo-lectores">Acciones</span></th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => (
          <tr key={producto.id}>
            <td>{producto.nombre}</td>
            <td>{producto.categoriaNombre}</td>
            <td className="numero">{formatoPrecio.format(producto.precioUnitario)}</td>
            <td className="numero">{producto.stockActual}</td>
            <td className="numero">{producto.stockMinimo}</td>
            <td className="columna-estado">
              {producto.stockBajo && <span className="etiqueta-stock-bajo">Stock bajo</span>}
            </td>
            <td className="columna-accion">
              <button type="button" className="boton boton-secundario boton-chico" onClick={() => onRegistrarMovimiento(producto.id)}>
                Registrar movimiento
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
