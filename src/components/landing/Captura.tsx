'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuBoxes, LuImage, LuMaximize2, LuMinus, LuSquare, LuX } from 'react-icons/lu';

type MarcoCaptura = 'navegador' | 'telefono' | 'simple';

interface CapturaProps {
  src: string;
  alt: string;
  textoNoDisponible: string;
  marco?: MarcoCaptura;
  className?: string;
  prioridad?: boolean;
}

function BarraVentana({ compacta = false }: { compacta?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 pl-2.5 ${
        compacta ? 'h-8' : 'h-9'
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={`flex items-center justify-center rounded-[4px] bg-gradient-to-br from-indigo-500 to-cyan-500 text-white ${
            compacta ? 'h-3.5 w-3.5' : 'h-4 w-4'
          }`}
        >
          <LuBoxes size={compacta ? 9 : 11} />
        </span>
        <span
          className={`truncate font-medium text-zinc-600 ${
            compacta ? 'hidden text-[10px] sm:inline' : 'text-xs'
          }`}
        >
          StockNext
        </span>
      </div>
      <div className="flex h-full items-center">
        <span
          className={`flex h-full items-center justify-center text-zinc-500 ${
            compacta ? 'w-6' : 'w-10'
          }`}
        >
          <LuMinus size={compacta ? 10 : 13} />
        </span>
        <span
          className={`flex h-full items-center justify-center text-zinc-500 ${
            compacta ? 'w-6' : 'w-10'
          }`}
        >
          <LuSquare size={compacta ? 8 : 10} />
        </span>
        <span
          className={`flex h-full items-center justify-center text-zinc-500 ${
            compacta ? 'w-6' : 'w-10'
          }`}
        >
          <LuX size={compacta ? 10 : 13} />
        </span>
      </div>
    </div>
  );
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
  const [abierta, setAbierta] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const esTelefono = marco === 'telefono';
  const ancho = esTelefono ? 322 : 1365;
  const alto = esTelefono ? 573 : 767;
  const sizes = esTelefono
    ? '(min-width: 640px) 160px, 128px'
    : '(min-width: 1024px) 50vw, 100vw';

  useEffect(() => {
    if (!abierta) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const alPresionar = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAbierta(false);
    };

    document.addEventListener('keydown', alPresionar);

    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener('keydown', alPresionar);
      triggerRef.current?.focus();
    };
  }, [abierta]);

  const contenido = (
    <div className="relative h-full w-full">
      {error ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-100 p-6 text-center text-sm font-medium text-zinc-700">
          <LuImage aria-hidden="true" size={32} />
          <span>{textoNoDisponible}</span>
        </div>
      ) : (
        <>
          <Image
            src={src}
            alt={alt}
            width={ancho}
            height={alto}
            sizes={sizes}
            className="h-full w-full object-cover"
            onError={() => setError(true)}
            {...(prioridad ? { preload: true } : { loading: 'lazy' as const })}
          />
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setAbierta(true)}
            aria-label={`Ampliar captura: ${alt}`}
            className="group/zoom absolute inset-0 z-10 flex cursor-zoom-in items-end justify-end p-3 focus-visible:outline-offset-[-4px]"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950/70 px-2.5 py-1 text-[11px] font-semibold text-white opacity-100 backdrop-blur transition-opacity sm:opacity-0 sm:group-hover/zoom:opacity-100 sm:group-focus-visible/zoom:opacity-100">
              <LuMaximize2 aria-hidden="true" size={12} />
              Ampliar
            </span>
          </button>
        </>
      )}
    </div>
  );

  const modal =
    abierta &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={`Vista ampliada: ${alt}`}
        onClick={() => setAbierta(false)}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            event.preventDefault();
            closeRef.current?.focus();
          }
        }}
      >
        <div
          className={`relative w-full ${esTelefono ? 'max-w-[320px]' : 'max-w-6xl'}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setAbierta(false)}
            aria-label="Cerrar vista ampliada"
            className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950/70 text-white shadow-lg backdrop-blur transition-colors hover:bg-zinc-950 focus-visible:outline-offset-2"
          >
            <LuX aria-hidden="true" size={20} />
          </button>
          <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
            {error ? (
              <div className="flex min-h-64 items-center justify-center p-8 text-center text-sm font-medium text-zinc-300">
                {textoNoDisponible}
              </div>
            ) : (
              <Image
                src={src}
                alt={alt}
                width={ancho}
                height={alto}
                sizes="100vw"
                loading="eager"
                className="mx-auto block h-auto max-h-[82vh] w-auto max-w-full object-contain"
                onError={() => setError(true)}
              />
            )}
          </div>
        </div>
      </div>,
      document.body
    );

  if (marco === 'telefono') {
    return (
      <>
        <div
          className={`sombra-tarjeta overflow-hidden rounded-xl border border-zinc-300 bg-white ${className}`}
        >
          <BarraVentana compacta />
          <div className="relative aspect-[9/16] overflow-hidden bg-white">
            {contenido}
          </div>
        </div>
        {modal}
      </>
    );
  }

  if (marco === 'navegador') {
    return (
      <>
        <div
          className={`sombra-tarjeta overflow-hidden rounded-xl border border-zinc-300 bg-white ${className}`}
        >
          <BarraVentana />
          <div className="relative aspect-[16/9] bg-zinc-100">{contenido}</div>
        </div>
        {modal}
      </>
    );
  }

  return (
    <>
      <div
        className={`sombra-tarjeta overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 ${className}`}
      >
        <div className="relative aspect-[16/9]">{contenido}</div>
      </div>
      {modal}
    </>
  );
}
