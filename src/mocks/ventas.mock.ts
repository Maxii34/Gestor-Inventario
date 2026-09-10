import { DetalleVenta, Venta } from '@/types';

export const MOCK_VENTAS: Venta[] = [
  {
    id: 'ven-1',
    codigoComprobante: '#V-00124',
    clienteId: 'cli-1',
    clienteNombre: 'Juan Pérez',
    detalles: [],
    total: 125000,
    metodoPago: 'Mercado Pago',
    estado: 'completada',
    fecha: '10/09/2026',
  },
  {
    id: 'ven-2',
    codigoComprobante: '#V-00123',
    clienteId: 'cli-2',
    clienteNombre: 'María González',
    detalles: [],
    total: 89900,
    metodoPago: 'Efectivo',
    estado: 'completada',
    fecha: '09/09/2026',
  },
  {
    id: 'ven-3',
    codigoComprobante: '#V-00122',
    clienteId: 'cli-3',
    clienteNombre: 'Carlos Rodríguez',
    detalles: [],
    total: 210500,
    metodoPago: 'Transferencia',
    estado: 'pendiente',
    fecha: '09/09/2026',
  },
  {
    id: 'ven-4',
    codigoComprobante: '#V-00121',
    clienteId: 'cli-4',
    clienteNombre: 'Ana Martínez',
    detalles: [],
    total: 45700,
    metodoPago: 'Tarjeta',
    estado: 'completada',
    fecha: '08/09/2026',
  },
  {
    id: 'ven-5',
    codigoComprobante: '#V-00120',
    clienteId: 'cli-5',
    clienteNombre: 'Pedro Sánchez',
    detalles: [],
    total: 320000,
    metodoPago: 'Transferencia',
    estado: 'pendiente',
    fecha: '08/09/2026',
  },
  {
    id: 'ven-6',
    codigoComprobante: '#V-00119',
    clienteId: 'cli-6',
    clienteNombre: 'Lucía Fernández',
    detalles: [],
    total: 78400,
    metodoPago: 'Efectivo',
    estado: 'cancelada',
    fecha: '07/09/2026',
  },
  {
    id: 'ven-7',
    codigoComprobante: '#V-00118',
    clienteId: 'cli-7',
    clienteNombre: 'Diego López',
    detalles: [],
    total: 156300,
    metodoPago: 'Mercado Pago',
    estado: 'completada',
    fecha: '07/09/2026',
  },
  {
    id: 'ven-8',
    codigoComprobante: '#V-00117',
    clienteId: 'cli-8',
    clienteNombre: 'Sofía Ramírez',
    detalles: [],
    total: 68900,
    metodoPago: 'Tarjeta',
    estado: 'completada',
    fecha: '06/09/2026',
  },
];

export interface ResumenVentas {
  periodo: number;
  cobradas: number;
  pendientes: number;
  canceladas: number;
  totalVendido: string;
}

// Resumen global fijo. Dato mock: no se calcula en tiempo de ejecución.
export const MOCK_VENTAS_RESUMEN: ResumenVentas = {
  periodo: 124,
  cobradas: 108,
  pendientes: 10,
  canceladas: 6,
  totalVendido: '$3.850.000',
};

// Productos precargados del formulario "Nueva venta".
// Subtotales y totales fijos: no se calculan en tiempo de ejecución.
export const MOCK_DETALLE_NUEVA_VENTA: DetalleVenta[] = [
  {
    productoId: 'prod-nv-1',
    productoNombre: 'Teclado mecánico',
    cantidad: 1,
    precioUnitario: 45000,
    subtotal: 45000,
  },
  {
    productoId: 'prod-nv-2',
    productoNombre: 'Mouse inalámbrico',
    cantidad: 1,
    precioUnitario: 18000,
    subtotal: 18000,
  },
  {
    productoId: 'prod-nv-3',
    productoNombre: 'Funda para notebook',
    cantidad: 1,
    precioUnitario: 10000,
    subtotal: 10000,
  },
  {
    productoId: 'prod-nv-4',
    productoNombre: 'Cable HDMI',
    cantidad: 1,
    precioUnitario: 8000,
    subtotal: 8000,
  },
];

export interface ResumenNuevaVenta {
  subtotal: string;
  descuento: string;
  total: string;
}

// Totales fijos del formulario. Dato mock: no se calcula en tiempo de ejecución.
export const MOCK_RESUMEN_NUEVA_VENTA: ResumenNuevaVenta = {
  subtotal: '$81.000',
  descuento: '$0',
  total: '$81.000',
};
