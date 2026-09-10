import { PageHeader, Button, Badge } from '@/components';
import { MOCK_USUARIOS } from '@/mocks';

export default function UsuariosPage() {
  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Listado visual. Sin CRUD ni conexión al backend."
        actions={<Button>Nuevo usuario</Button>}
      />
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USUARIOS.map((u) => (
              <tr key={u.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{u.nombre}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.rol}</td>
                <td className="px-4 py-2">
                  <Badge tone={u.estado === 'activo' ? 'success' : 'neutral'}>{u.estado}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
