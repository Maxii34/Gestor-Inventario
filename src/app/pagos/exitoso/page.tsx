import { Badge, Button, Card } from '@/components';
import { MOCK_PAGO_EXITOSO } from '@/mocks';

export default function PagoExitosoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <Card padding="lg" className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-6 w-6 text-green-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="mt-3 text-xl font-bold text-zinc-900">
            Pago realizado correctamente
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{MOCK_PAGO_EXITOSO.mensaje}</p>
        </div>
        <dl className="mt-6 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Venta</dt>
            <dd className="font-medium text-zinc-900">{MOCK_PAGO_EXITOSO.referencia}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Cliente</dt>
            <dd className="font-medium text-zinc-900">{MOCK_PAGO_EXITOSO.clienteNombre}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Total</dt>
            <dd className="font-medium text-zinc-900">
              ${MOCK_PAGO_EXITOSO.monto.toLocaleString('es-AR')}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-zinc-500">Estado</dt>
            <dd>
              <Badge tone="success">Pagada</Badge>
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" fullWidth>
            Volver a ventas
          </Button>
          <Button type="button" fullWidth>
            Ver venta
          </Button>
        </div>
      </Card>
    </div>
  );
}
