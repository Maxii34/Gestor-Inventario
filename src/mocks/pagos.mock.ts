import { ResultadoPago } from '@/types';

export const MOCK_PAGO: ResultadoPago = {
  transaccionId: 'txn-124',
  clienteNombre: 'Juan Pérez',
  monto: 81000,
  metodoPago: 'Mercado Pago',
  estado: 'pendiente',
  referencia: '#V-00124',
  fecha: '2026-09-10 10:00',
  mensaje: 'Revisa la información de la venta antes de continuar con el cobro.',
};

export const MOCK_PAGO_EXITOSO: ResultadoPago = {
  transaccionId: 'txn-124',
  clienteNombre: 'Juan Pérez',
  monto: 81000,
  metodoPago: 'Mercado Pago',
  estado: 'exitoso',
  referencia: '#V-00124',
  fecha: '2026-09-10 10:05',
  mensaje: 'El pago fue procesado correctamente y la operación quedó registrada.',
};

export const MOCK_PAGO_PENDIENTE: ResultadoPago = {
  transaccionId: 'txn-124',
  clienteNombre: 'Juan Pérez',
  monto: 81000,
  metodoPago: 'Mercado Pago',
  estado: 'pendiente',
  referencia: '#V-00124',
  fecha: '2026-09-10 10:05',
  mensaje:
    'El pago todavía no fue confirmado. El estado se actualizará cuando el sistema reciba la confirmación correspondiente.',
};

export const MOCK_PAGO_FALLIDO: ResultadoPago = {
  transaccionId: 'txn-124',
  clienteNombre: 'Juan Pérez',
  monto: 81000,
  metodoPago: 'Mercado Pago',
  estado: 'fallido',
  referencia: '#V-00124',
  fecha: '2026-09-10 10:05',
  mensaje: 'El pago no pudo completarse. Podrás revisar la operación e intentarlo nuevamente.',
};
