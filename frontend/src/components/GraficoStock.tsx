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
const COLOR_TEXTO = '#3d3d3a';
const COLOR_GRILLA = '#e6e5e1';
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
    <section className="grafico">
      <h2>Stock actual por producto</h2>
      <div className="leyenda">
        <span><span className="muestra" style={{ backgroundColor: COLOR_STOCK_NORMAL }} />Stock normal</span>
        <span><span className="muestra" style={{ backgroundColor: COLOR_STOCK_BAJO }} />Stock bajo</span>
      </div>
      <ResponsiveContainer width="100%" height={alto}>
        <BarChart data={productosOrdenados} layout="vertical" margin={{ right: 40 }}>
          <CartesianGrid horizontal={false} stroke={COLOR_GRILLA} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="nombre" width={180} />
          <Bar dataKey="stockActual" barSize={24} radius={[0, 4, 4, 0]} shape={BarraProducto}>
            <LabelList dataKey="stockActual" position="right" fill={COLOR_TEXTO} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
