import { LuArrowLeft, LuCircleX } from 'react-icons/lu';
import { Badge, Button, Card } from '@/components';
import { MOCK_PAGO_FALLIDO } from '@/mocks';

export default function PagoFallidoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <Card padding="lg" className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
          >
            <LuCircleX aria-hidden="true" size={24} className="text-red-700" />
          </span>
          <h1 className="mt-3 text-xl font-bold text-zinc-900">
            No se pudo procesar el pago
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{MOCK_PAGO_FALLIDO.mensaje}</p>
        </div>
        <dl className="mt-6 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Venta</dt>
            <dd className="font-medium text-zinc-900">{MOCK_PAGO_FALLIDO.referencia}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Total</dt>
            <dd className="font-medium text-zinc-900">
              ${MOCK_PAGO_FALLIDO.monto.toLocaleString('es-AR')}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-zinc-500">Estado</dt>
            <dd>
              <Badge tone="danger">Fallido</Badge>
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" fullWidth>
            <LuArrowLeft aria-hidden="true" size={16} />
            Volver a ventas
          </Button>
          <Button type="button" fullWidth>
            Intentar nuevamente
          </Button>
        </div>
      </Card>
    </div>
  );
}
