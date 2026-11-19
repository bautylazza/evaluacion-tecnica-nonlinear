import { useEffect, useState } from 'react';
import { obtenerProductos } from '../api/productos';
import type { Producto } from '../types/Producto';

const MENSAJE_ERROR_CARGA = 'No se pudieron cargar los productos. Verificá que el backend esté corriendo.';

export function useProductos(categoriaId: number | null, habilitado: boolean) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [numeroDeCarga, setNumeroDeCarga] = useState(0);

  useEffect(() => {
    if (!habilitado) {
      return;
    }
    let respuestaVigente = true;
    obtenerProductos(categoriaId)
      .then((lista) => {
        if (respuestaVigente) {
          setProductos(lista);
          setError(null);
        }
      })
      .catch((excepcion) => {
        console.error(excepcion);
        if (respuestaVigente) setError(MENSAJE_ERROR_CARGA);
      });
    return () => {
      respuestaVigente = false;
    };
  }, [categoriaId, habilitado, numeroDeCarga]);

  function recargar() {
    setNumeroDeCarga((anterior) => anterior + 1);
  }

  return { productos, error, recargar };
}
