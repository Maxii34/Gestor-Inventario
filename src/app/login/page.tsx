import { Button, Input, Card } from '@/components';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card title="Iniciar sesión" className="w-full max-w-sm">
        <div className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="usuario@empresa.com" />
          <Input label="Contraseña" type="password" placeholder="••••••••" />
          <Button>Ingresar</Button>
          <p className="text-center text-xs text-zinc-500">
            Pantalla visual — sin autenticación ni conexión al backend.
          </p>
        </div>
      </Card>
    </div>
  );
}
