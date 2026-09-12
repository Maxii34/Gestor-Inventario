'use client';

import { useCallback, useEffect, useState } from 'react';
import { LuBanknote, LuCalendarDays } from 'react-icons/lu';
import { Button, Card, FormField, Input } from '@/components';
import { ApiError } from '@/lib/api/client';
import { obtenerRecaudacion, type Recaudacion } from '@/services/estadisticas.service';

function toISODate(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function rangoHoy(): { desde: string; hasta: string } {
  const hoy = toISODate(new Date());
  return { desde: hoy, hasta: hoy };
}

function rangoMesActual(): { desde: string; hasta: string } {
  const ahora = new Date();
  const desde = toISODate(new Date(ahora.getFullYear(), ahora.getMonth(), 1));
  const hasta = toISODate(new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0));
  return { desde, hasta };
}

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(valor);
}

export function RecaudacionCard() {
  const [rangoInicial] = useState(rangoMesActual);
  const [desde, setDesde] = useState(rangoInicial.desde);
  const [hasta, setHasta] = useState(rangoInicial.hasta);
  const [datos, setDatos] = useState<Recaudacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const consultar = useCallback(async (desdeParam: string, hastaParam: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const resultado = await obtenerRecaudacion(desdeParam, hastaParam);
      setDatos(resultado);
    } catch (err) {
      setDatos(null);
      setError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar la recaudación. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void consultar(rangoInicial.desde, rangoInicial.hasta);
  }, [consultar, rangoInicial]);

  function aplicarRango(rango: { desde: string; hasta: string }): void {
    setDesde(rango.desde);
    setHasta(rango.hasta);
    void consultar(rango.desde, rango.hasta);
  }

  return (
    <Card
      title="Recaudación"
      subtitle="Total agregado del período seleccionado"
      actions={<LuBanknote aria-hidden="true" size={16} className="text-zinc-400" />}
      className="h-full"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => aplicarRango(rangoHoy())}
          >
            <LuCalendarDays aria-hidden="true" size={14} />
            Hoy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => aplicarRango(rangoMesActual())}
          >
            <LuCalendarDays aria-hidden="true" size={14} />
            Este mes
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Desde" htmlFor="recaudacion-desde">
            <Input
              id="recaudacion-desde"
              type="date"
              value={desde}
              max={hasta || undefined}
              disabled={isLoading}
              onChange={(event) => setDesde(event.target.value)}
            />
          </FormField>
          <FormField label="Hasta" htmlFor="recaudacion-hasta">
            <Input
              id="recaudacion-hasta"
              type="date"
              value={hasta}
              min={desde || undefined}
              disabled={isLoading}
              onChange={(event) => setHasta(event.target.value)}
            />
          </FormField>
        </div>

        <div>
          <Button
            type="button"
            disabled={isLoading || !desde || !hasta}
            onClick={() => void consultar(desde, hasta)}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Consultando…' : 'Consultar'}
          </Button>
        </div>

        <div aria-live="polite" className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" aria-hidden="true" />
              <div className="h-3 w-56 animate-pulse rounded bg-zinc-200" aria-hidden="true" />
              <span className="sr-only">Cargando recaudación…</span>
            </div>
          ) : error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : datos ? (
            <>
              <p className="text-2xl font-bold text-zinc-900">
                {formatoMoneda(Number(datos.totalRecaudado) || 0)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Recaudado entre {datos.desde} y {datos.hasta}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
