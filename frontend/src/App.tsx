import { useEffect, useState } from 'react';
import { obtenerProductos } from './api/productos';
import { AlertaStockBajo } from './components/AlertaStockBajo';
import { FiltroCategoria } from './components/FiltroCategoria';
import { GraficoStock } from './components/GraficoStock';
import { TablaProductos } from './components/TablaProductos';
import type { Producto } from './types/Producto';

const MENSAJE_ERROR_CARGA = 'No se pudieron cargar los productos. Verificá que el backend esté corriendo.';

export default function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarProductos() {
      try {
        setProductos(await obtenerProductos());
      } catch (excepcion) {
        console.error(excepcion);
        setError(MENSAJE_ERROR_CARGA);
      }
    }
    cargarProductos();
  }, []);

  useEffect(() => {
    if (categoriaId === null) {
      return;
    }
    let respuestaVigente = true;
    async function cargarProductosFiltrados(categoria: number) {
      try {
        const lista = await obtenerProductos(categoria);
        if (respuestaVigente) {
          setProductosFiltrados(lista);
        }
      } catch (excepcion) {
        console.error(excepcion);
        setError(MENSAJE_ERROR_CARGA);
      }
    }
    cargarProductosFiltrados(categoriaId);
    return () => {
      respuestaVigente = false;
    };
  }, [categoriaId]);

  const productosVisibles = categoriaId === null ? productos : productosFiltrados;

  return (
    <main className="contenedor">
      <h1>Inventario</h1>
      {error && <p className="error">{error}</p>}
      <AlertaStockBajo productos={productos} />
      <FiltroCategoria productos={productos} categoriaId={categoriaId} onCambiar={setCategoriaId} />
      <TablaProductos productos={productosVisibles} />
      <GraficoStock productos={productosVisibles} />
    </main>
  );
}
