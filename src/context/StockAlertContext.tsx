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
import { cargarTodasLasPaginas } from '@/lib/api/paginacion';
import type { BackendProducto } from '@/services/productos.service';

const INTERVALO_REFRESCO_MS = 5 * 60 * 1000;

interface StockAlertContextValue {
  stockBajoCount: number;
  refrescar: () => Promise<void>;
}

const StockAlertContext = createContext<StockAlertContextValue | null>(null);

export function StockAlertProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [stockBajoCount, setStockBajoCount] = useState(0);
  const enVuelo = useRef<Promise<void> | null>(null);

  const refrescar = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setStockBajoCount(0);
      return;
    }
    if (enVuelo.current) return enVuelo.current;

    const tarea = (async () => {
      try {
        const productos = await cargarTodasLasPaginas<BackendProducto>('/productos');
        setStockBajoCount(
          productos.filter((producto) => producto.stock <= producto.stockMinimo).length,
        );
      } catch {
        // Un fallo de red no debe romper la navegación ni borrar el último valor.
      } finally {
        enVuelo.current = null;
      }
    })();

    enVuelo.current = tarea;
    return tarea;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void Promise.resolve().then(() => refrescar());

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

  const value = useMemo<StockAlertContextValue>(
    () => ({ stockBajoCount, refrescar }),
    [stockBajoCount, refrescar],
  );

  return <StockAlertContext.Provider value={value}>{children}</StockAlertContext.Provider>;
}

const VALOR_POR_DEFECTO: StockAlertContextValue = {
  stockBajoCount: 0,
  refrescar: async () => {},
};

export function useStockAlert(): StockAlertContextValue {
  return useContext(StockAlertContext) ?? VALOR_POR_DEFECTO;
}
