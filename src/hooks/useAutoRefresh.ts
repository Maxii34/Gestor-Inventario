import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAutoRefreshOptions {
  intervaloMs?: number;
  pausado?: boolean;
}

export interface UseAutoRefreshResult {
  ultimaActualizacion: Date | null;
  actualizando: boolean;
  hayError: boolean;
  refrescar: () => Promise<void>;
}

const INTERVALO_POR_DEFECTO = 20000;
const VARIACION_INTERVALO = 0.1;
const INTERVALO_MAXIMO = 120000;
const UMBRAL_REFRESCO = 5000;

function esNoAutorizado(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: unknown }).status === 401
  );
}

export function useAutoRefresh(
  cargar: () => Promise<void>,
  opciones: UseAutoRefreshOptions = {},
): UseAutoRefreshResult {
  const { intervaloMs = INTERVALO_POR_DEFECTO, pausado = false } = opciones;

  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [hayError, setHayError] = useState(false);

  const cargarRef = useRef(cargar);
  const intervaloRef = useRef(intervaloMs);
  const pausadoRef = useRef(pausado);
  const esperaRef = useRef(intervaloMs);
  const ultimaCargaRef = useRef<number>(Date.now());
  const detenidoRef = useRef(false);
  const montadoRef = useRef(false);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cargaRef = useRef<Promise<void> | null>(null);
  const iniciarCargaRef = useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    cargarRef.current = cargar;
  }, [cargar]);

  const estaPausado = useCallback((): boolean => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return true;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return true;
    }
    return pausadoRef.current;
  }, []);

  const programar = useCallback(
    (espera: number): void => {
      if (temporizadorRef.current !== null) {
        clearTimeout(temporizadorRef.current);
        temporizadorRef.current = null;
      }
      if (detenidoRef.current || estaPausado()) return;

      const variacion = 1 + (Math.random() * 2 - 1) * VARIACION_INTERVALO;
      const demora = Math.min(espera * variacion, INTERVALO_MAXIMO);

      temporizadorRef.current = setTimeout(() => {
        temporizadorRef.current = null;
        void iniciarCargaRef.current();
      }, demora);
    },
    [estaPausado],
  );

  const iniciarCarga = useCallback((): Promise<void> => {
    if (detenidoRef.current) return Promise.resolve();
    if (cargaRef.current) return cargaRef.current;
    if (estaPausado()) return Promise.resolve();

    const promesa = (async (): Promise<void> => {
      if (montadoRef.current) setActualizando(true);
      try {
        await cargarRef.current();
        if (!montadoRef.current) return;
        setHayError(false);
        esperaRef.current = intervaloRef.current;
        ultimaCargaRef.current = Date.now();
        setUltimaActualizacion(new Date());
      } catch (error) {
        if (!montadoRef.current) return;
        setHayError(true);
        if (esNoAutorizado(error)) {
          detenidoRef.current = true;
        } else {
          esperaRef.current = Math.min(esperaRef.current * 2, INTERVALO_MAXIMO);
        }
      } finally {
        if (montadoRef.current) setActualizando(false);
      }

      if (!montadoRef.current || detenidoRef.current || estaPausado()) return;
      programar(esperaRef.current);
    })();

    cargaRef.current = promesa;
    void promesa.finally(() => {
      if (cargaRef.current === promesa) cargaRef.current = null;
    });

    return promesa;
  }, [estaPausado, programar]);

  useEffect(() => {
    iniciarCargaRef.current = iniciarCarga;
  }, [iniciarCarga]);

  useEffect(() => {
    intervaloRef.current = intervaloMs;
    esperaRef.current = intervaloMs;
    if (temporizadorRef.current !== null) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
    if (!pausadoRef.current && !detenidoRef.current) programar(intervaloMs);
  }, [intervaloMs, programar]);

  useEffect(() => {
    pausadoRef.current = pausado;
    if (pausado) {
      if (temporizadorRef.current !== null) {
        clearTimeout(temporizadorRef.current);
        temporizadorRef.current = null;
      }
      return;
    }
    if (!detenidoRef.current) programar(esperaRef.current);
  }, [pausado, programar]);

  useEffect(() => {
    montadoRef.current = true;

    const intentarRefrescar = (): void => {
      if (detenidoRef.current || estaPausado()) return;
      if (Date.now() - ultimaCargaRef.current > UMBRAL_REFRESCO) {
        void iniciarCarga();
        return;
      }
      if (temporizadorRef.current === null) programar(esperaRef.current);
    };

    const alCambiarVisibilidad = (): void => {
      if (document.visibilityState === 'visible') {
        intentarRefrescar();
      } else if (temporizadorRef.current !== null) {
        clearTimeout(temporizadorRef.current);
        temporizadorRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    window.addEventListener('focus', intentarRefrescar);
    window.addEventListener('online', intentarRefrescar);

    return () => {
      montadoRef.current = false;
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('focus', intentarRefrescar);
      window.removeEventListener('online', intentarRefrescar);
      if (temporizadorRef.current !== null) {
        clearTimeout(temporizadorRef.current);
        temporizadorRef.current = null;
      }
    };
  }, [estaPausado, iniciarCarga, programar]);

  const refrescar = useCallback(async (): Promise<void> => {
    await iniciarCarga();
  }, [iniciarCarga]);

  return { ultimaActualizacion, actualizando, hayError, refrescar };
}
