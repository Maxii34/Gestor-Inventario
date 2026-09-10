export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface MovimientoStock {
  id: string;
  productoId: string;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  usuarioNombre: string;
  fecha: string;
}
