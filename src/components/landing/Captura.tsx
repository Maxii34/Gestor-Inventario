'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LuImage } from 'react-icons/lu';

type MarcoCaptura = 'navegador' | 'telefono' | 'simple';

interface CapturaProps {
  src: string;
  alt: string;
  textoNoDisponible: string;
  marco?: MarcoCaptura;
  className?: string;
  prioridad?: boolean;
}

export function Captura({
  src,
  alt,
  textoNoDisponible,
  marco = 'simple',
  className = '',
  prioridad = false,
}: CapturaProps) {
  const [error, setError] = useState(false);

  const contenido = error ? (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-100 p-6 text-center text-sm font-medium text-zinc-600">
      <LuImage aria-hidden="true" size={32} />
      <span>{textoNoDisponible}</span>
    </div>
  ) : (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 50vw, 100vw"
      loading={prioridad ? 'eager' : 'lazy'}
      className="object-cover"
      onError={() => setError(true)}
    />
  );

  if (marco === 'telefono') {
    return (
      <div
        className={`sombra-tarjeta overflow-hidden rounded-2xl border-4 border-zinc-900 bg-zinc-900 ${className}`}
      >
        <div className="relative aspect-[9/19] overflow-hidden rounded-2xl bg-white">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-2 z-10 h-2 w-16 -translate-x-1/2 rounded-full bg-zinc-900"
          />
          {contenido}
        </div>
      </div>
    );
  }

  if (marco === 'navegador') {
    return (
      <div
        className={`sombra-tarjeta overflow-hidden rounded-2xl border border-zinc-200 bg-white ${className}`}
      >
        <div
          aria-hidden="true"
          className="flex h-10 items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </div>
        <div className="relative aspect-[16/10] bg-zinc-100">{contenido}</div>
      </div>
    );
  }

  return (
    <div
      className={`sombra-tarjeta overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 ${className}`}
    >
      <div className="relative aspect-[16/10]">{contenido}</div>
    </div>
  );
}
