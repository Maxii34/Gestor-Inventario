import { AppLayout, PageHeader, Button, Badge } from '@/components';
import { MOCK_MOVIMIENTOS } from '@/mocks';

export default function MovimientosPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Movimientos de stock"
        description="Historial visual de entradas, salidas y ajustes."
        actions={<Button>Registrar movimiento</Button>}
      />
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Motivo</th>
              <th className="px-4 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_MOVIMIENTOS.map((m) => (
              <tr key={m.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{m.productoNombre}</td>
                <td className="px-4 py-2">
                  <Badge
                    tone={m.tipo === 'entrada' ? 'success' : m.tipo === 'salida' ? 'warning' : 'neutral'}
                  >
                    {m.tipo}
                  </Badge>
                </td>
                <td className="px-4 py-2">{m.cantidad}</td>
                <td className="px-4 py-2">{m.motivo}</td>
                <td className="px-4 py-2">{m.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
