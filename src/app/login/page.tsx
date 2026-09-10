import { Button, Card, Checkbox, Input } from '@/components';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <Card padding="lg" className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white"
          >
            GI
          </span>
          <h1 className="mt-3 text-xl font-bold text-zinc-900">Gestor de Inventario</h1>
          <p className="mt-1 text-sm text-zinc-500">Panel administrativo</p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="usuario@empresa.com"
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between gap-4">
            <Checkbox label="Recordarme" />
            <button
              type="button"
              className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <Button type="button" size="lg" fullWidth>
            Iniciar sesión
          </Button>
        </div>
      </Card>
    </div>
  );
}
