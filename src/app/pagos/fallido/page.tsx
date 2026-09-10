import { Card } from '@/components';
import { MOCK_PAGO_FALLIDO } from '@/mocks';

export default function PagoFallidoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card title="Pago fallido" className="w-full max-w-md border-red-200">
        <p className="text-sm text-zinc-600">{MOCK_PAGO_FALLIDO.mensaje}</p>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Transacción</dt>
            <dd>{MOCK_PAGO_FALLIDO.transaccionId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Monto</dt>
            <dd>${MOCK_PAGO_FALLIDO.monto}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Referencia</dt>
            <dd>{MOCK_PAGO_FALLIDO.referencia}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
