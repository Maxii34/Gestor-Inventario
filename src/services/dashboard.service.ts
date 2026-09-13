import { apiRequest } from '@/lib/api/client';
import type { ApiListResponse } from '@/types/api';
import type {
  DatosDashboard,
  EstadoStockBajo,
  EstadoVentaReciente,
  ProductoStockBajo,
  VentaReciente,
} from '@/types/dashboard';

interface BackendCategoria {
  id: number;
  nombre: string;
}

interface BackendProducto {
  id: number;
  nombre: string;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  categoria?: BackendCategoria | null;
}

interface BackendCliente {
  id: number;
  nombre: string;
  apellido: string;
}

interface BackendVenta {
  id: number;
  total: number | string;
  metodoPago: string;
  estado: string;
  cliente?: BackendCliente | null;
  fecha: string;
}

const PRODUCTOS_PAGE_SIZE = 100;
const VENTAS_RECIENTES_LIMIT = 5;
const STOCK_BAJO_MAX = 5;

const ESTADO_VENTA: Record<string, EstadoVentaReciente> = {
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Pagada',
  ANULADA: 'Cancelada',
  RECHAZADA: 'Rechazada',
};

function toNumber(value: number | string): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatoMoneda(value: number | string): string {
  return `$${toNumber(value).toLocaleString('es-AR')}`;
}

function formatoFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha);
}

function mapEstadoStock(stockActual: number): EstadoStockBajo {
  return stockActual === 0 ? 'Crítico' : 'Bajo';
}

export async function getDatosDashboard(): Promise<DatosDashboard> {
  const [productos, ventas, clientes] = await Promise.all([
    apiRequest<ApiListResponse<BackendProducto>>(
      `/productos?page=1&limit=${PRODUCTOS_PAGE_SIZE}`,
      { auth: true },
    ),
    apiRequest<ApiListResponse<BackendVenta>>(
      `/ventas?page=1&limit=${VENTAS_RECIENTES_LIMIT}`,
      { auth: true },
    ),
    apiRequest<ApiListResponse<unknown>>('/clientes?page=1&limit=1', { auth: true }),
  ]);

  const conStockBajo = productos.data.filter(
    (producto) => producto.stock <= producto.stockMinimo,
  );

  const stockBajo: ProductoStockBajo[] = conStockBajo.slice(0, STOCK_BAJO_MAX).map((producto) => ({
    id: String(producto.id),
    producto: producto.nombre,
    categoria: producto.categoria?.nombre ?? '—',
    stockActual: producto.stock,
    stockMinimo: producto.stockMinimo,
    estado: mapEstadoStock(producto.stock),
  }));

  const ventasRecientes: VentaReciente[] = ventas.data.map((venta) => ({
    id: String(venta.id),
    venta: `#${venta.id}`,
    cliente: venta.cliente
      ? `${venta.cliente.nombre} ${venta.cliente.apellido}`.trim()
      : 'Consumidor final',
    fecha: formatoFecha(venta.fecha),
    total: formatoMoneda(venta.total),
    estado: ESTADO_VENTA[venta.estado] ?? 'Pendiente',
  }));

  return {
    resumen: {
      totalProductos: productos.meta.total,
      productosActivos: productos.data.filter((producto) => producto.activo).length,
      stockBajo: conStockBajo.length,
      totalVentas: ventas.meta.total,
      totalClientes: clientes.meta.total,
    },
    ventasRecientes,
    stockBajo,
  };
}
