'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { MENSAJE_SOLO_LECTURA } from '@/lib/suscripcion';
import { obtenerSuscripcion } from '@/services/suscripcion.service';
import type { SuscripcionEstado } from '@/types/suscripcion';

const INTERVALO_REFRESCO_MS = 10 * 60 * 1000;

interface SuscripcionContextValue {
  suscripcion: SuscripcionEstado | null;
  soloLectura: boolean;
  motivoSoloLectura: string;
  refrescar: () => Promise<void>;
  marcarSoloLectura: () => void;
}

const SuscripcionContext = createContext<SuscripcionContextValue | null>(null);

export function SuscripcionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [suscripcion, setSuscripcion] = useState<SuscripcionEstado | null>(null);
  const [soloLecturaForzado, setSoloLecturaForzado] = useState(false);
  const enVuelo = useRef<Promise<void> | null>(null);

  const refrescar = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    if (enVuelo.current) return enVuelo.current;

    const tarea = (async () => {
      try {
        const datos = await obtenerSuscripcion();
        setSuscripcion(datos);
        setSoloLecturaForzado(false);
      } catch {
        // Un fallo de red (o del endpoint) no debe bloquear la pantalla ni
        // borrar el último estado conocido.
      } finally {
        enVuelo.current = null;
      }
    })();

    enVuelo.current = tarea;
    return tarea;
  }, [isAuthenticated]);

  const marcarSoloLectura = useCallback((): void => {
    setSoloLecturaForzado(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSuscripcion(null);
      setSoloLecturaForzado(false);
      return;
    }

    void refrescar();

    const alEnfocar = (): void => {
      void refrescar();
    };
    const alCambiarVisibilidad = (): void => {
      if (document.visibilityState === 'visible') void refrescar();
    };

    window.addEventListener('focus', alEnfocar);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    const intervalo = window.setInterval(() => {
      void refrescar();
    }, INTERVALO_REFRESCO_MS);

    return () => {
      window.removeEventListener('focus', alEnfocar);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.clearInterval(intervalo);
    };
  }, [isAuthenticated, refrescar]);

  const soloLectura = Boolean(suscripcion?.soloLectura) || soloLecturaForzado;

  const value = useMemo<SuscripcionContextValue>(
    () => ({
      suscripcion,
      soloLectura,
      motivoSoloLectura: MENSAJE_SOLO_LECTURA,
      refrescar,
      marcarSoloLectura,
    }),
    [suscripcion, soloLectura, refrescar, marcarSoloLectura],
  );

  return (
    <SuscripcionContext.Provider value={value}>
      {children}
    </SuscripcionContext.Provider>
  );
}

export function useSuscripcion(): SuscripcionContextValue {
  const context = useContext(SuscripcionContext);
  if (!context) {
    throw new Error('useSuscripcion debe utilizarse dentro de un SuscripcionProvider.');
  }
  return context;
}

export function useSoloLectura(): {
  soloLectura: boolean;
  motivoSoloLectura: string;
} {
  const { soloLectura, motivoSoloLectura } = useSuscripcion();
  return { soloLectura, motivoSoloLectura };
}
