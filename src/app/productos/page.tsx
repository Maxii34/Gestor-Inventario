import { AppLayout, PageHeader, Button, Badge } from '@/components';
import { MOCK_PRODUCTOS } from '@/mocks';

export default function ProductosPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Productos"
        description="Listado visual. Sin CRUD ni conexión al backend."
        actions={<Button>Nuevo producto</Button>}
      />
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PRODUCTOS.map((p) => (
              <tr key={p.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{p.codigo}</td>
                <td className="px-4 py-2">{p.nombre}</td>
                <td className="px-4 py-2">{p.categoriaNombre}</td>
                <td className="px-4 py-2">${p.precio}</td>
                <td className="px-4 py-2">{p.stockActual}</td>
                <td className="px-4 py-2">
                  <Badge tone={p.estado === 'activo' ? 'success' : 'neutral'}>{p.estado}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
