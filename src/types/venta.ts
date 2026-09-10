export type EstadoVenta = 'completada' | 'pendiente' | 'cancelada';

export interface DetalleVenta {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  codigoComprobante: string;
  clienteId: string;
  clienteNombre: string;
  detalles: DetalleVenta[];
  total: number;
  metodoPago: string;
  estado: EstadoVenta;
  fecha: string;
}
