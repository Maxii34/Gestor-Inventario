export type EstadoVentaReciente = 'Pagada' | 'Pendiente' | 'Cancelada' | 'Rechazada';

export type EstadoStockBajo = 'Crítico' | 'Bajo';

export interface VentaReciente {
  id: string;
  venta: string;
  cliente: string;
  fecha: string;
  total: string;
  estado: EstadoVentaReciente;
}

export interface ProductoStockBajo {
  id: string;
  producto: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  estado: EstadoStockBajo;
}

export interface ResumenDashboard {
  totalProductos: number;
  productosActivos: number;
  stockBajo: number;
  totalVentas: number;
  totalClientes: number;
}

export interface DatosDashboard {
  resumen: ResumenDashboard;
  ventasRecientes: VentaReciente[];
  stockBajo: ProductoStockBajo[];
}
