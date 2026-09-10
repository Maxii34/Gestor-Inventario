import { AppLayout, PageHeader, Button, Card, Badge } from '@/components';
import { MOCK_CATEGORIAS } from '@/mocks';

export default function CategoriasPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Categorías"
        description="Listado visual. Sin CRUD ni conexión al backend."
        actions={<Button>Nueva categoría</Button>}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MOCK_CATEGORIAS.map((c) => (
          <Card key={c.id} title={c.nombre}>
            <p className="text-sm text-zinc-500">{c.descripcion}</p>
            <p className="mt-2 text-sm">Productos: {c.cantidadProductos}</p>
            <div className="mt-2">
              <Badge tone={c.estado === 'activa' ? 'success' : 'neutral'}>{c.estado}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
