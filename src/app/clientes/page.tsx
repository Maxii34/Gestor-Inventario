import { AppLayout, PageHeader, Button, Badge } from '@/components';
import { MOCK_CLIENTES } from '@/mocks';

export default function ClientesPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Clientes"
        description="Listado visual. Sin CRUD ni conexión al backend."
        actions={<Button>Nuevo cliente</Button>}
      />
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CLIENTES.map((c) => (
              <tr key={c.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">{c.telefono}</td>
                <td className="px-4 py-2">
                  <Badge tone={c.estado === 'activo' ? 'success' : 'neutral'}>{c.estado}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
