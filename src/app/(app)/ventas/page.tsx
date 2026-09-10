import { PageHeader, Button, Badge } from '@/components';
import { MOCK_VENTAS } from '@/mocks';

export default function VentasPage() {
  return (
    <>
      <PageHeader
        title="Ventas"
        description="Listado visual. Sin CRUD ni conexión al backend."
        actions={<Button>Nueva venta</Button>}
      />
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Comprobante</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Pago</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_VENTAS.map((v) => (
              <tr key={v.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{v.codigoComprobante}</td>
                <td className="px-4 py-2">{v.clienteNombre}</td>
                <td className="px-4 py-2">${v.total}</td>
                <td className="px-4 py-2">{v.metodoPago}</td>
                <td className="px-4 py-2">
                  <Badge tone={v.estado === 'completada' ? 'success' : 'warning'}>{v.estado}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
