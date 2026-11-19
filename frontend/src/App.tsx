import { useState } from 'react';
import { AlertaStockBajo } from './components/AlertaStockBajo';
import { FiltroCategoria } from './components/FiltroCategoria';
import { GraficoStock } from './components/GraficoStock';
import { TablaProductos } from './components/TablaProductos';
import { useProductos } from './hooks/useProductos';

export default function App() {
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const listadoCompleto = useProductos(null, true);
  const listadoFiltrado = useProductos(categoriaId, categoriaId !== null);
  const productosVisibles = categoriaId === null ? listadoCompleto.productos : listadoFiltrado.productos;
  const error = listadoCompleto.error ?? listadoFiltrado.error;

  return (
    <main className="contenedor">
      <h1>Inventario</h1>
      {error && <p className="error">{error}</p>}
      <AlertaStockBajo productos={listadoCompleto.productos} />
      <section className="tarjeta">
        <div className="tarjeta-encabezado">
          <h2>Productos</h2>
        </div>
        <div className="barra-filtros">
          <FiltroCategoria productos={listadoCompleto.productos} categoriaId={categoriaId} onCambiar={setCategoriaId} />
        </div>
        <div className="tabla-desplazable">
          <TablaProductos productos={productosVisibles} />
        </div>
      </section>
      <GraficoStock productos={productosVisibles} />
    </main>
  );
}
