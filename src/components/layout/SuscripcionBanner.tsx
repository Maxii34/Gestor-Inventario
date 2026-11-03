'use client';

import { useEffect, useState } from 'react';
import { LuClock, LuLockKeyhole, LuX } from 'react-icons/lu';
import { useSuscripcion } from '@/context/SuscripcionContext';

interface BannerProps {
  tono: 'info' | 'warning' | 'danger';
  icono: 'reloj' | 'candado';
  mensaje: string;
  cerrable?: boolean;
  onCerrar?: () => void;
}

const TONOS: Record<
  BannerProps['tono'],
  { contenedor: string; icono: string; boton: string; role: 'status' | 'alert' }
> = {
  info: {
    contenedor: 'border-sky-200 bg-sky-50 text-sky-900',
    icono: 'text-sky-600',
    boton: 'text-sky-700 hover:bg-sky-100',
    role: 'status',
  },
  warning: {
    contenedor: 'border-amber-200 bg-amber-50 text-amber-900',
    icono: 'text-amber-600',
    boton: 'text-amber-700 hover:bg-amber-100',
    role: 'alert',
  },
  danger: {
    contenedor: 'border-red-300 bg-red-50 text-red-900 shadow-sm',
    icono: 'text-red-600',
    boton: 'text-red-700 hover:bg-red-100',
    role: 'alert',
  },
};

function Banner({ tono, icono, mensaje, cerrable, onCerrar }: BannerProps) {
  const estilos = TONOS[tono];
  const Icono = icono === 'candado' ? LuLockKeyhole : LuClock;

  return (
    <div
      role={estilos.role}
      className={`mb-4 flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${estilos.contenedor}`}
    >
      <Icono
        aria-hidden="true"
        size={18}
        className={`mt-0.5 shrink-0 ${estilos.icono}`}
      />
      <p className={`flex-1 leading-5 ${tono === 'danger' ? 'font-semibold' : 'font-medium'}`}>
        {mensaje}
      </p>
      {cerrable && onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso de suscripción"
          className={`shrink-0 rounded-md p-1 transition-colors ${estilos.boton}`}
        >
          <LuX aria-hidden="true" size={16} />
        </button>
      )}
    </div>
  );
}

export function SuscripcionBanner() {
  const { suscripcion, soloLectura } = useSuscripcion();
  const [cerrado, setCerrado] = useState(false);

  const firma = `${suscripcion?.estado ?? 'sin-estado'}:${suscripcion?.plan ?? ''}:${
    suscripcion?.diasRestantes ?? ''
  }:${soloLectura}`;

  useEffect(() => {
    setCerrado(false);
  }, [firma]);

  if (!suscripcion && !soloLectura) return null;

  if (soloLectura || suscripcion?.estado === 'VENCIDA') {
    return (
      <Banner
        tono="danger"
        icono="candado"
        mensaje="Modo solo lectura: tu suscripción venció. Podés consultar tus datos pero no modificarlos. Contactá a soporte."
      />
    );
  }

  if (!suscripcion) return null;

  const { estado, plan, diasRestantes } = suscripcion;
  const dias = diasRestantes ?? 0;

  if (estado === 'SIN_VENCIMIENTO') return null;

  if (estado === 'EN_GRACIA') {
    return (
      <Banner
        tono="warning"
        icono="reloj"
        mensaje={`Tu suscripción venció. Tenés ${dias} ${
          dias === 1 ? 'día' : 'días'
        } para renovarla antes de que el sistema pase a solo lectura.`}
      />
    );
  }

  if (estado !== 'VIGENTE' || diasRestantes === null || diasRestantes > 5) {
    return null;
  }

  if (cerrado) return null;

  const esPrueba = plan === 'PRUEBA';
  const mensaje =
    dias === 1
      ? `Te queda 1 día ${esPrueba ? 'de prueba' : 'de tu suscripción'}.`
      : `Te quedan ${dias} días ${esPrueba ? 'de prueba' : 'de tu suscripción'}.`;

  return (
    <Banner
      tono="info"
      icono="reloj"
      mensaje={mensaje}
      cerrable={dias > 3}
      onCerrar={() => setCerrado(true)}
    />
  );
}
