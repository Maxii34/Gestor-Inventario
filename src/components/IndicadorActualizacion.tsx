'use client';

import { useEffect, useRef, useState } from 'react';
import { LuRefreshCw } from 'react-icons/lu';

interface IndicadorActualizacionProps {
  ultimaActualizacion: Date | null;
  actualizando: boolean;
  hayError: boolean;
  refrescar: () => Promise<void>;
}

function formatearTiempo(transcurridoMs: number): string {
  const segundos = Math.max(0, Math.floor(transcurridoMs / 1000));
  if (segundos < 60) return `Actualizado hace ${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  return `Actualizado hace ${minutos} min`;
}

export default function IndicadorActualizacion({
  ultimaActualizacion,
  actualizando,
  hayError,
  refrescar,
}: IndicadorActualizacionProps) {
  const [ahora, setAhora] = useState<number | null>(null);
  const montajeRef = useRef(0);

  useEffect(() => {
    montajeRef.current = Date.now();
    setAhora(Date.now());
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const referencia = ultimaActualizacion?.getTime() ?? montajeRef.current;
  const texto =
    ahora === null ? 'Actualizado hace 0 s' : formatearTiempo(ahora - referencia);

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs text-zinc-500"
        role={hayError ? 'status' : undefined}
      >
        {hayError ? 'Sin conexión, reintentando…' : texto}
      </span>
      <button
        type="button"
        onClick={() => void refrescar()}
        disabled={actualizando}
        aria-label="Actualizar"
        aria-busy={actualizando}
        title="Actualizar"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LuRefreshCw
          aria-hidden="true"
          size={16}
          className={actualizando ? 'animate-spin' : undefined}
        />
      </button>
    </div>
  );
}
