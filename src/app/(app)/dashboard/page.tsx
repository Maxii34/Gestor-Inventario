import {
  Badge,
  Button,
  Card,
  PageHeader,
  Table,
  type TableColumn,
} from '@/components';
import {
  MOCK_DASHBOARD_RESUMEN,
  MOCK_STOCK_BAJO,
  MOCK_VENTAS_RECIENTES,
  type EstadoStock,
  type EstadoVenta,
  type ProductoStockBajo,
  type VentaReciente,
} from '@/mocks';

const VENTA_TONO: Record<EstadoVenta, 'success' | 'warning' | 'danger'> = {
  Pagada: 'success',
  Pendiente: 'warning',
  Cancelada: 'danger',
};

const STOCK_TONO: Record<EstadoStock, 'danger' | 'warning'> = {
  Crítico: 'danger',
  Bajo: 'warning',
};

const VENTAS_COLUMNAS: TableColumn<VentaReciente>[] = [
  { key: 'venta', header: 'Venta' },
  { key: 'cliente', header: 'Cliente' },
  { key: 'fecha', header: 'Fecha' },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    render: (row) => `$${row.total.toLocaleString('es-AR')}`,
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => <Badge tone={VENTA_TONO[row.estado]}>{row.estado}</Badge>,
  },
];

const STOCK_COLUMNAS: TableColumn<ProductoStockBajo>[] = [
  { key: 'producto', header: 'Producto' },
  { key: 'categoria', header: 'Categoría' },
  { key: 'stockActual', header: 'Stock actual', align: 'center' },
  { key: 'stockMinimo', header: 'Stock mínimo', align: 'center' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => <Badge tone={STOCK_TONO[row.estado]}>{row.estado}</Badge>,
  },
];

const ACCIONES_RAPIDAS = [
  'Nuevo producto',
  'Nueva venta',
  'Nuevo cliente',
  'Registrar movimiento',
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Resumen general del negocio" />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {MOCK_DASHBOARD_RESUMEN.map((item) => (
            <Card key={item.id} title={item.titulo}>
              <p className="text-2xl font-bold text-zinc-900">{item.valor}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.contexto}</p>
              <div className="mt-3">
                <Badge tone={item.tono}>{item.indicador}</Badge>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
          <Card title="Ventas recientes" subtitle="Últimas operaciones registradas">
            <Table
              columns={VENTAS_COLUMNAS}
              data={MOCK_VENTAS_RECIENTES}
              getRowKey={(row) => row.id}
              emptyMessage="Sin ventas recientes."
            />
          </Card>

          <Card title="Productos con stock bajo" subtitle="Requieren reposición">
            <Table
              columns={STOCK_COLUMNAS}
              data={MOCK_STOCK_BAJO}
              getRowKey={(row) => row.id}
              emptyMessage="Sin productos con stock bajo."
            />
          </Card>
        </div>

        <Card title="Acciones rápidas" subtitle="Accesos visuales sin funcionalidad">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {ACCIONES_RAPIDAS.map((accion) => (
              <Button key={accion} type="button" variant="outline" fullWidth>
                {accion}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
