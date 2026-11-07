'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LuEye, LuEyeOff, LuKeyRound, LuLogOut, LuSave } from 'react-icons/lu';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import { notifySuccess } from '@/lib/notifications/toast';

export function MandatoryPasswordModal() {
  const { cambiarPassword, logout, user } = useAuth();
  const router = useRouter();
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user?.debeCambiarPassword) return null;

  async function enviar(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;
    if (passwordNueva !== confirmacion) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await cambiarPassword(passwordActual, passwordNueva);
      notifySuccess('Contraseña actualizada', 'Ya podés continuar usando StockNext.');
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function mantenerModal(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key !== 'Tab') return;

    const controles = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled])',
    );
    const primero = controles.item(0);
    const ultimo = controles.item(controles.length - 1);
    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-zinc-950/60 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cambio-password-titulo"
        onKeyDown={mantenerModal}
        className="my-auto max-h-[85dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:p-6"
      >
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <LuKeyRound aria-hidden="true" size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="cambio-password-titulo" className="text-lg font-semibold text-zinc-950">
              Actualizá tu contraseña
            </h2>
            <p className="mt-1 truncate text-sm leading-5 text-zinc-600 sm:whitespace-normal sm:overflow-visible sm:text-clip">
              Cambiá tu contraseña para continuar.
            </p>
          </div>
        </div>

        <form onSubmit={(event) => void enviar(event)} className="space-y-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Contraseña actual
            <span className="relative">
              <input
                type={mostrarPasswordActual ? 'text' : 'password'}
                autoComplete="current-password"
                autoFocus
                required
                value={passwordActual}
                onChange={(event) => setPasswordActual(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 font-normal text-zinc-900 outline-none focus:border-zinc-900"
              />
              <button
                type="button"
                aria-label={mostrarPasswordActual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
                onClick={() => setMostrarPasswordActual((mostrar) => !mostrar)}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {mostrarPasswordActual ? <LuEyeOff aria-hidden="true" size={17} /> : <LuEye aria-hidden="true" size={17} />}
              </button>
            </span>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Nueva contraseña
            <span className="relative">
              <input
                type={mostrarPasswordNueva ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                maxLength={72}
                required
                value={passwordNueva}
                onChange={(event) => setPasswordNueva(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 font-normal text-zinc-900 outline-none focus:border-zinc-900"
              />
              <button
                type="button"
                aria-label={mostrarPasswordNueva ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                onClick={() => setMostrarPasswordNueva((mostrar) => !mostrar)}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {mostrarPasswordNueva ? <LuEyeOff aria-hidden="true" size={17} /> : <LuEye aria-hidden="true" size={17} />}
              </button>
            </span>
            <span className="text-xs font-normal text-zinc-500">Mínimo 6 caracteres.</span>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Confirmar nueva contraseña
            <span className="relative">
              <input
                type={mostrarConfirmacion ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                maxLength={72}
                required
                value={confirmacion}
                onChange={(event) => setConfirmacion(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 font-normal text-zinc-900 outline-none focus:border-zinc-900"
              />
              <button
                type="button"
                aria-label={mostrarConfirmacion ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                onClick={() => setMostrarConfirmacion((mostrar) => !mostrar)}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {mostrarConfirmacion ? <LuEyeOff aria-hidden="true" size={17} /> : <LuEye aria-hidden="true" size={17} />}
              </button>
            </span>
          </label>
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-between gap-2 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
            >
              <LuLogOut aria-hidden="true" size={15} />
              Cerrar sesión
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <LuKeyRound aria-hidden="true" size={16} /> : <LuSave aria-hidden="true" size={16} />}
              {isSubmitting ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
