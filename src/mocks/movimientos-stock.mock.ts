import { MovimientoStock } from '@/types';

export const MOCK_MOVIMIENTOS: MovimientoStock[] = [
  {
    id: 'mov-1',
    productoId: 'prod-1',
    productoNombre: 'Teclado Mecánico RGB',
    tipo: 'entrada',
    cantidad: 10,
    motivo: 'Compra a proveedor',
    usuarioNombre: 'Carlos Pérez',
    fecha: '2026-03-01 10:30',
  },
  {
    id: 'mov-2',
    productoId: 'prod-2',
    productoNombre: 'Mouse Inalámbrico Pro',
    tipo: 'salida',
    cantidad: 2,
    motivo: 'Venta #V001',
    usuarioNombre: 'Ana Gómez',
    fecha: '2026-03-02 14:15',
  },
];
