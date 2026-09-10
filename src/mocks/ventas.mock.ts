import { Venta } from '@/types';

export const MOCK_VENTAS: Venta[] = [
  {
    id: 'ven-1',
    codigoComprobante: 'VNT-2026-001',
    clienteId: 'cli-1',
    clienteNombre: 'Empresa Alpha S.A.',
    detalles: [
      {
        productoId: 'prod-1',
        productoNombre: 'Teclado Mecánico RGB',
        cantidad: 2,
        precioUnitario: 45000,
        subtotal: 90000,
      },
    ],
    total: 90000,
    metodoPago: 'Transferencia',
    estado: 'completada',
    fecha: '2026-03-01 11:00',
  },
  {
    id: 'ven-2',
    codigoComprobante: 'VNT-2026-002',
    clienteId: 'cli-2',
    clienteNombre: 'Juan Rodríguez',
    detalles: [
      {
        productoId: 'prod-2',
        productoNombre: 'Mouse Inalámbrico Pro',
        cantidad: 1,
        precioUnitario: 25000,
        subtotal: 25000,
      },
    ],
    total: 25000,
    metodoPago: 'Mercado Pago',
    estado: 'completada',
    fecha: '2026-03-02 15:40',
  },
];
