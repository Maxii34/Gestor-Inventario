import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAutoRefreshOptions {
  intervaloMs?: number;
  pausado?: boolean;
  inactividadMs?: number;
  intervaloInactivoMs?: number;
}

export interface UseAutoRefreshResult {
  ultimaActualizacion: Date | null;
  actualizando: boolean;
  hayError: boolean;
  refrescar: () => Promise<void>;
}

const INTERVALO_POR_DEFECTO = 20000;
const INTERVALO_INACTIVO_POR_DEFECTO = 150000;
const INACTIVIDAD_POR_DEFECTO = 10 * 60 * 1000;
const ACTIVIDAD_MINIMA_MS = 1000;
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
  const {
    intervaloMs = INTERVALO_POR_DEFECTO,
    pausado = false,
    inactividadMs = INACTIVIDAD_POR_DEFECTO,
    intervaloInactivoMs = INTERVALO_INACTIVO_POR_DEFECTO,
  } = opciones;

  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [hayError, setHayError] = useState(false);

  const cargarRef = useRef(cargar);
  const intervaloRef = useRef(intervaloMs);
  const pausadoRef = useRef(pausado);
  const esperaRef = useRef(intervaloMs);
  const ultimaCargaRef = useRef<number>(0);
  const detenidoRef = useRef(false);
  const montadoRef = useRef(false);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cargaRef = useRef<Promise<void> | null>(null);
  const iniciarCargaRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const inactivoRef = useRef(false);
  const intervaloInactivoRef = useRef(intervaloInactivoMs);
  const inactividadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimaActividadRef = useRef<number>(0);

  useEffect(() => {
    const ahora = Date.now();
    ultimaCargaRef.current = ahora;
    ultimaActividadRef.current = ahora;
  }, []);

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

  const limiteEspera = useCallback((): number => {
    if (inactivoRef.current) {
      return Math.max(INTERVALO_MAXIMO, intervaloInactivoRef.current * 2);
    }
    return INTERVALO_MAXIMO;
  }, []);

  const programar = useCallback(
    (espera: number): void => {
      if (temporizadorRef.current !== null) {
        clearTimeout(temporizadorRef.current);
        temporizadorRef.current = null;
      }
      if (detenidoRef.current || estaPausado()) return;

      const variacion = 1 + (Math.random() * 2 - 1) * VARIACION_INTERVALO;
      const demora = Math.min(espera * variacion, limiteEspera());

      temporizadorRef.current = setTimeout(() => {
        temporizadorRef.current = null;
        void iniciarCargaRef.current();
      }, demora);
    },
    [estaPausado, limiteEspera],
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
        esperaRef.current = inactivoRef.current
          ? intervaloInactivoRef.current
          : intervaloRef.current;
        ultimaCargaRef.current = Date.now();
        setUltimaActualizacion(new Date());
      } catch (error) {
        if (!montadoRef.current) return;
        setHayError(true);
        if (esNoAutorizado(error)) {
          detenidoRef.current = true;
        } else {
          esperaRef.current = Math.min(esperaRef.current * 2, limiteEspera());
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
  }, [estaPausado, limiteEspera, programar]);

  useEffect(() => {
    iniciarCargaRef.current = iniciarCarga;
  }, [iniciarCarga]);

  const limpiarTimerInactividad = useCallback((): void => {
    if (inactividadTimerRef.current !== null) {
      clearTimeout(inactividadTimerRef.current);
      inactividadTimerRef.current = null;
    }
  }, []);

  const programarTimerInactividad = useCallback((): void => {
    limpiarTimerInactividad();
    if (inactividadMs <= 0 || detenidoRef.current) return;

    inactividadTimerRef.current = setTimeout(() => {
      inactividadTimerRef.current = null;
      if (detenidoRef.current) return;

      inactivoRef.current = true;
      esperaRef.current = intervaloInactivoRef.current;

      if (temporizadorRef.current !== null) {
        clearTimeout(temporizadorRef.current);
        temporizadorRef.current = null;
      }

      if (!estaPausado()) programar(esperaRef.current);
    }, inactividadMs);
  }, [estaPausado, inactividadMs, limpiarTimerInactividad, programar]);

  const marcarActividad = useCallback((): void => {
    const ahora = Date.now();
    if (ahora - ultimaActividadRef.current < ACTIVIDAD_MINIMA_MS) return;

    ultimaActividadRef.current = ahora;
    programarTimerInactividad();

    if (!inactivoRef.current) return;

    inactivoRef.current = false;
    esperaRef.current = intervaloRef.current;

    if (temporizadorRef.current !== null) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }

    if (detenidoRef.current || estaPausado()) return;

    if (Date.now() - ultimaCargaRef.current > intervaloRef.current) {
      void iniciarCarga();
      return;
    }

    programar(esperaRef.current);
  }, [estaPausado, iniciarCarga, programar, programarTimerInactividad]);

  useEffect(() => {
    intervaloRef.current = intervaloMs;
    esperaRef.current = inactivoRef.current
      ? intervaloInactivoRef.current
      : intervaloMs;
    if (temporizadorRef.current !== null) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
    if (!pausadoRef.current && !detenidoRef.current) programar(esperaRef.current);
  }, [intervaloMs, programar]);

  useEffect(() => {
    intervaloInactivoRef.current = intervaloInactivoMs;
    if (!inactivoRef.current) return;

    esperaRef.current = intervaloInactivoMs;
    if (temporizadorRef.current !== null) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
    if (!pausadoRef.current && !detenidoRef.current) programar(esperaRef.current);
  }, [intervaloInactivoMs, programar]);

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
      marcarActividad();
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
  }, [estaPausado, iniciarCarga, marcarActividad, programar]);

  useEffect(() => {
    if (inactividadMs <= 0) return;

    programarTimerInactividad();
    const alActivar = (): void => marcarActividad();
    const eventos = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'];

    for (const evento of eventos) {
      document.addEventListener(evento, alActivar, { passive: true, capture: true });
    }

    return () => {
      for (const evento of eventos) {
        document.removeEventListener(evento, alActivar, { capture: true });
      }
      limpiarTimerInactividad();
    };
  }, [inactividadMs, limpiarTimerInactividad, marcarActividad, programarTimerInactividad]);

  const refrescar = useCallback(async (): Promise<void> => {
    await iniciarCarga();
  }, [iniciarCarga]);

  return { ultimaActualizacion, actualizando, hayError, refrescar };
}
