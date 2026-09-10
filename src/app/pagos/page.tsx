import { Button, Card, PageHeader } from '@/components';
import { MOCK_PAGO } from '@/mocks';

export default function PagosPage() {
  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
      <div className="mx-auto w-full max-w-lg">
        <PageHeader
          title="Procesar pago"
          description="Revisa la información de la venta antes de continuar con el cobro."
        />
        <Card padding="lg">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Número de venta</dt>
              <dd className="font-medium text-zinc-900">{MOCK_PAGO.referencia}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Cliente</dt>
              <dd className="font-medium text-zinc-900">{MOCK_PAGO.clienteNombre}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Medio de pago</dt>
              <dd className="font-medium text-zinc-900">{MOCK_PAGO.metodoPago}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-zinc-100 pt-2 text-base font-bold text-zinc-900">
              <dt>Total</dt>
              <dd>${MOCK_PAGO.monto.toLocaleString('es-AR')}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" size="lg" fullWidth>
              Continuar al pago
            </Button>
            <Button type="button" variant="outline" fullWidth>
              Volver a ventas
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
