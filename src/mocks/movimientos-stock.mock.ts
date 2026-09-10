import { MovimientoStock } from '@/types';

export const MOCK_MOVIMIENTOS: MovimientoStock[] = [
  {
    id: 'mov-1',
    productoId: 'prod-1',
    productoNombre: 'Notebook Lenovo IdeaPad',
    tipo: 'entrada',
    cantidad: 20,
    stockAnterior: 15,
    stockNuevo: 35,
    motivo: 'Compra a proveedor',
    usuarioNombre: 'Carlos Pérez',
    fecha: '2026-09-09 10:30',
  },
  {
    id: 'mov-2',
    productoId: 'prod-2',
    productoNombre: 'Mouse Logitech M185',
    tipo: 'salida',
    cantidad: 5,
    stockAnterior: 9,
    stockNuevo: 4,
    motivo: 'Venta VNT-2026-102',
    usuarioNombre: 'Ana Gómez',
    fecha: '2026-09-09 12:15',
  },
  {
    id: 'mov-3',
    productoId: 'prod-3',
    productoNombre: 'Teclado Redragon',
    tipo: 'entrada',
    cantidad: 12,
    stockAnterior: 0,
    stockNuevo: 12,
    motivo: 'Compra a proveedor',
    usuarioNombre: 'Carlos Pérez',
    fecha: '2026-09-08 09:45',
  },
  {
    id: 'mov-4',
    productoId: 'prod-4',
    productoNombre: 'Monitor Samsung 24"',
    tipo: 'ajuste',
    cantidad: -2,
    stockAnterior: 9,
    stockNuevo: 7,
    motivo: 'Conteo de inventario',
    usuarioNombre: 'Ana Gómez',
    fecha: '2026-09-08 16:20',
  },
  {
    id: 'mov-5',
    productoId: 'prod-5',
    productoNombre: 'Auriculares JBL',
    tipo: 'salida',
    cantidad: 3,
    stockAnterior: 5,
    stockNuevo: 2,
    motivo: 'Venta VNT-2026-098',
    usuarioNombre: 'Carlos Pérez',
    fecha: '2026-09-07 11:05',
  },
  {
    id: 'mov-6',
    productoId: 'prod-7',
    productoNombre: 'Disco SSD Kingston 480GB',
    tipo: 'entrada',
    cantidad: 25,
    stockAnterior: 10,
    stockNuevo: 35,
    motivo: 'Compra a proveedor',
    usuarioNombre: 'Ana Gómez',
    fecha: '2026-09-06 14:40',
  },
  {
    id: 'mov-7',
    productoId: 'prod-8',
    productoNombre: 'Memoria RAM Kingston 8GB',
    tipo: 'salida',
    cantidad: 4,
    stockAnterior: 4,
    stockNuevo: 0,
    motivo: 'Venta VNT-2026-095',
    usuarioNombre: 'Carlos Pérez',
    fecha: '2026-09-05 17:25',
  },
];

export interface ResumenMovimientos {
  totales: number;
  entradas: number;
  salidas: number;
  ajustes: number;
}

// Resumen global fijo. Dato mock: no se calcula en tiempo de ejecución.
export const MOCK_MOVIMIENTOS_RESUMEN: ResumenMovimientos = {
  totales: 248,
  entradas: 96,
  salidas: 137,
  ajustes: 15,
};
