import { ResultadoPago } from '@/types';

export const MOCK_PAGO_EXITOSO: ResultadoPago = {
  transaccionId: 'txn-001',
  monto: 90000,
  metodoPago: 'Mercado Pago',
  estado: 'exitoso',
  referencia: 'VNT-2026-001',
  fecha: '2026-03-01 11:05',
  mensaje: 'El pago fue acreditado correctamente.',
};

export const MOCK_PAGO_PENDIENTE: ResultadoPago = {
  transaccionId: 'txn-002',
  monto: 25000,
  metodoPago: 'Mercado Pago',
  estado: 'pendiente',
  referencia: 'VNT-2026-002',
  fecha: '2026-03-02 15:45',
  mensaje: 'El pago está pendiente de acreditación.',
};

export const MOCK_PAGO_FALLIDO: ResultadoPago = {
  transaccionId: 'txn-003',
  monto: 45000,
  metodoPago: 'Mercado Pago',
  estado: 'fallido',
  referencia: 'VNT-2026-003',
  fecha: '2026-03-02 16:00',
  mensaje: 'El pago fue rechazado. Intentá con otro medio.',
};
