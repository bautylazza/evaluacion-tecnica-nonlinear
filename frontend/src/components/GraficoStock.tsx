import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { BarShapeProps } from 'recharts';
import type { Producto } from '../types/Producto';

type Props = {
  productos: Producto[];
};

const COLOR_STOCK_NORMAL = '#2a78d6';
const COLOR_STOCK_BAJO = '#d03b3b';
const COLOR_TEXTO = '#1f1f1d';
const COLOR_TEXTO_SECUNDARIO = '#5f5e5a';
const COLOR_GRILLA = '#e6e5e1';
const ESTILO_EJE = { fill: COLOR_TEXTO_SECUNDARIO, fontSize: 13 };
const ALTO_POR_PRODUCTO = 40;
const ALTO_EJE = 40;

function BarraProducto(props: BarShapeProps) {
  const producto: Producto = props.payload;
  const color = producto.stockBajo ? COLOR_STOCK_BAJO : COLOR_STOCK_NORMAL;
  return <Rectangle {...props} fill={color} />;
}

export function GraficoStock({ productos }: Props) {
  const productosOrdenados = [...productos].sort((a, b) => a.stockActual - b.stockActual);
  const alto = productos.length * ALTO_POR_PRODUCTO + ALTO_EJE;

  return (
    <section className="seccion">
      <h2>Stock actual por producto</h2>
      <div className="tarjeta">
        <div className="barra-tarjeta leyenda">
          <span><span className="muestra" style={{ backgroundColor: COLOR_STOCK_NORMAL }} />Stock normal</span>
          <span><span className="muestra" style={{ backgroundColor: COLOR_STOCK_BAJO }} />Stock bajo</span>
        </div>
        <div className="grafico-cuerpo">
          <ResponsiveContainer width="100%" height={alto}>
            <BarChart data={productosOrdenados} layout="vertical" margin={{ right: 40 }}>
              <CartesianGrid horizontal={false} stroke={COLOR_GRILLA} />
              <XAxis type="number" allowDecimals={false} tick={ESTILO_EJE} stroke={COLOR_GRILLA} tickLine={false} />
              <YAxis type="category" dataKey="nombre" width={180} tick={ESTILO_EJE} stroke={COLOR_GRILLA} tickLine={false} />
              <Bar dataKey="stockActual" barSize={24} radius={[0, 4, 4, 0]} shape={BarraProducto}>
                <LabelList dataKey="stockActual" position="right" fill={COLOR_TEXTO} fontSize={13} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
