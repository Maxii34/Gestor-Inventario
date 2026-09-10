export type EstadoPago = 'exitoso' | 'pendiente' | 'fallido';

export interface ResultadoPago {
  transaccionId: string;
  clienteNombre: string;
  monto: number;
  metodoPago: string;
  estado: EstadoPago;
  referencia: string;
  fecha: string;
  mensaje: string;
}
