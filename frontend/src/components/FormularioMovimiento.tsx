import { useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorApi } from '../api/errores';
import { registrarMovimiento } from '../api/movimientos';
import type { TipoMovimiento } from '../types/Movimiento';
import type { Producto } from '../types/Producto';

type Props = {
  productos: Producto[];
  productoIdInicial: number;
  onCerrar: () => void;
  onRegistrado: () => void;
  onStockDesactualizado: () => void;
};

const MENSAJE_ERROR_ENVIO = 'No se pudo registrar el movimiento. Intentá de nuevo.';

function calcularStockResultante(stockActual: number, tipo: TipoMovimiento, cantidad: number): number {
  return tipo === 'ENTRADA' ? stockActual + cantidad : stockActual - cantidad;
}

export function FormularioMovimiento({
  productos,
  productoIdInicial,
  onCerrar,
  onRegistrado,
  onStockDesactualizado,
}: Props) {
  const [productoId, setProductoId] = useState(productoIdInicial);
  const [tipo, setTipo] = useState<TipoMovimiento>('ENTRADA');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const producto = productos.find((candidato) => candidato.id === productoId);
  const cantidadNumerica = Number(cantidad);
  const cantidadValida = Number.isInteger(cantidadNumerica) && cantidadNumerica > 0;
  const stockInsuficiente = producto !== undefined && tipo === 'SALIDA' && cantidadValida
    && cantidadNumerica > producto.stockActual;
  const puedeEnviar = producto !== undefined && cantidadValida && !stockInsuficiente
    && usuario.trim() !== '' && !enviando;

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (producto === undefined || !puedeEnviar) {
      return;
    }
    setEnviando(true);
    setErrorEnvio(null);
    try {
      await registrarMovimiento({
        productoId: producto.id,
        tipo,
        cantidad: cantidadNumerica,
        motivo: motivo.trim() === '' ? null : motivo.trim(),
        usuario: usuario.trim(),
      });
      onRegistrado();
    } catch (excepcion) {
      console.error(excepcion);
      if (excepcion instanceof ErrorApi && excepcion.status === 409) {
        setErrorEnvio(excepcion.message);
        onStockDesactualizado();
      } else {
        setErrorEnvio(MENSAJE_ERROR_ENVIO);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-fondo">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario">Registrar movimiento</h2>
        <p className="aclaracion-obligatorios">
          Los campos con <span className="obligatorio">*</span> son obligatorios.
        </p>
        <form onSubmit={manejarEnvio}>
          <label className="campo">
            <span>Producto <span className="obligatorio" aria-hidden="true">*</span></span>
            <select required value={productoId} onChange={(evento) => setProductoId(Number(evento.target.value))}>
              {productos.map((opcion) => (
                <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
              ))}
            </select>
          </label>

          <fieldset className="campo selector-tipo">
            <legend>Tipo <span className="obligatorio" aria-hidden="true">*</span></legend>
            <label>
              <input type="radio" name="tipo" checked={tipo === 'ENTRADA'} onChange={() => setTipo('ENTRADA')} />
              Entrada
            </label>
            <label>
              <input type="radio" name="tipo" checked={tipo === 'SALIDA'} onChange={() => setTipo('SALIDA')} />
              Salida
            </label>
          </fieldset>

          <label className="campo">
            <span>Cantidad <span className="obligatorio" aria-hidden="true">*</span></span>
            <input required type="number" min="1" step="1" value={cantidad} onChange={(evento) => setCantidad(evento.target.value)} />
          </label>
          {producto && (
            <p className={stockInsuficiente ? 'vista-previa vista-previa-error' : 'vista-previa'}>
              Stock actual: {producto.stockActual}
              {cantidadValida && ` → quedará en ${calcularStockResultante(producto.stockActual, tipo, cantidadNumerica)}`}
            </p>
          )}
          {producto && stockInsuficiente && (
            <p className="mensaje-campo-error">Stock insuficiente: hay {producto.stockActual} unidades</p>
          )}

          <label className="campo">
            Motivo
            <input type="text" maxLength={255} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
          </label>

          <label className="campo">
            <span>Usuario <span className="obligatorio" aria-hidden="true">*</span></span>
            <input required type="text" maxLength={100} value={usuario} onChange={(evento) => setUsuario(evento.target.value)} />
          </label>

          {errorEnvio && <p className="error">{errorEnvio}</p>}

          <div className="modal-botones">
            <button type="button" className="boton boton-secundario" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="boton boton-principal" disabled={!puedeEnviar}>
              {tipo === 'ENTRADA' ? 'Registrar entrada' : 'Registrar salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
