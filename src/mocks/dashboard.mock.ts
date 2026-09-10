export interface ResumenItem {
  id: string;
  titulo: string;
  valor: string;
  contexto: string;
  indicador: string;
  tono: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

export type EstadoVenta = 'Pagada' | 'Pendiente' | 'Cancelada';

export interface VentaReciente {
  id: string;
  venta: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: EstadoVenta;
}

export type EstadoStock = 'Crítico' | 'Bajo';

export interface ProductoStockBajo {
  id: string;
  producto: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  estado: EstadoStock;
}

export const MOCK_DASHBOARD_RESUMEN: ResumenItem[] = [
  {
    id: 'res-productos',
    titulo: 'Productos',
    valor: '128',
    contexto: '32 categorías activas',
    indicador: 'Estable',
    tono: 'neutral',
  },
  {
    id: 'res-stock-bajo',
    titulo: 'Stock bajo',
    valor: '12',
    contexto: '4 productos en estado crítico',
    indicador: 'Revisar',
    tono: 'warning',
  },
  {
    id: 'res-ventas',
    titulo: 'Ventas',
    valor: '$1.250.000',
    contexto: '86 operaciones del mes',
    indicador: 'En alza',
    tono: 'success',
  },
  {
    id: 'res-clientes',
    titulo: 'Clientes',
    valor: '86',
    contexto: '12 nuevos este mes',
    indicador: 'Estable',
    tono: 'info',
  },
];

export const MOCK_VENTAS_RECIENTES: VentaReciente[] = [
  {
    id: 'ven-rec-1',
    venta: 'VNT-2026-101',
    cliente: 'Empresa Alpha S.A.',
    fecha: '2026-09-08',
    total: 320000,
    estado: 'Pagada',
  },
  {
    id: 'ven-rec-2',
    venta: 'VNT-2026-102',
    cliente: 'Juan Rodríguez',
    fecha: '2026-09-08',
    total: 85500,
    estado: 'Pendiente',
  },
  {
    id: 'ven-rec-3',
    venta: 'VNT-2026-103',
    cliente: 'Comercio Sur',
    fecha: '2026-09-07',
    total: 147200,
    estado: 'Pagada',
  },
  {
    id: 'ven-rec-4',
    venta: 'VNT-2026-104',
    cliente: 'Lucía Fernández',
    fecha: '2026-09-06',
    total: 58900,
    estado: 'Cancelada',
  },
  {
    id: 'ven-rec-5',
    venta: 'VNT-2026-105',
    cliente: 'Distribuidora Norte',
    fecha: '2026-09-05',
    total: 410000,
    estado: 'Pagada',
  },
];

export const MOCK_STOCK_BAJO: ProductoStockBajo[] = [
  {
    id: 'sb-1',
    producto: 'Mouse Inalámbrico Pro',
    categoria: 'Periféricos',
    stockActual: 3,
    stockMinimo: 5,
    estado: 'Bajo',
  },
  {
    id: 'sb-2',
    producto: 'Cable HDMI 2.1',
    categoria: 'Accesorios',
    stockActual: 1,
    stockMinimo: 10,
    estado: 'Crítico',
  },
  {
    id: 'sb-3',
    producto: 'Fuente 650W Bronze',
    categoria: 'Componentes',
    stockActual: 2,
    stockMinimo: 4,
    estado: 'Bajo',
  },
  {
    id: 'sb-4',
    producto: 'Tóner Negro T200',
    categoria: 'Impresión',
    stockActual: 0,
    stockMinimo: 6,
    estado: 'Crítico',
  },
];
