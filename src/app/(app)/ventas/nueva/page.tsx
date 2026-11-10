import Link from 'next/link';
import { LuHistory } from 'react-icons/lu';
import { PageHeader } from '@/components';
import { NuevaVentaForm } from '@/components/ventas/NuevaVentaForm';

export default function NuevaVentaPage() {
  return (
    <>
      <PageHeader
        title="Nueva venta"
        description="Buscá productos, ajustá las cantidades y confirmá la operación."
        actions={
          <Link
            href="/ventas"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            <LuHistory aria-hidden="true" size={16} />
            Ver historial
          </Link>
        }
      />
      <NuevaVentaForm />
    </>
  );
}
