import { PageHeader, Card } from '@/components';

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen visual del inventario. Sin conexión al backend."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card title="Productos">—</Card>
        <Card title="Stock bajo">—</Card>
        <Card title="Ventas del mes">—</Card>
        <Card title="Clientes">—</Card>
      </div>
    </>
  );
}
