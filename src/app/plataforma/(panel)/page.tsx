'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LuActivity,
  LuArrowUpRight,
  LuBuilding2,
  LuCalendarClock,
  LuCircleDollarSign,
  LuRefreshCw,
  LuShieldAlert,
  LuUsers,
} from 'react-icons/lu';
import { Button, Card, EmptyState, PageHeader } from '@/components';
import { ApiError } from '@/lib/api/client';
import { obtenerMetricas } from '@/services/plataforma.service';

function nombreCampo(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (letter) => letter.toLocaleUpperCase('es-AR'));
}

function extraerMetricas(
  values: Record<string, unknown>,
  prefix = '',
): { label: string; value: string | number }[] {
  return Object.entries(values).flatMap(([key, value]) => {
    const label = prefix ? `${prefix} · ${nombreCampo(key)}` : nombreCampo(key);
    if (typeof value === 'number' || typeof value === 'string') return [{ label, value }];
    if (typeof value === 'boolean') return [{ label, value: value ? 'Sí' : 'No' }];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return extraerMetricas(value as Record<string, unknown>, label);
    }
    return [];
  });
}

function metricIcon(label: string) {
  const normalized = label.toLocaleLowerCase('es-AR');
  if (normalized.includes('pago') || normalized.includes('ingreso') || normalized.includes('monto')) {
    return LuCircleDollarSign;
  }
  if (normalized.includes('venc') || normalized.includes('gracia')) return LuCalendarClock;
  if (normalized.includes('usuario') || normalized.includes('admin')) return LuUsers;
  if (normalized.includes('suspend')) return LuShieldAlert;
  if (normalized.includes('actividad') || normalized.includes('auditor')) return LuActivity;
  return LuBuilding2;
}

export default function PlataformaDashboardPage() {
  const [metricas, setMetricas] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMetricas = useCallback(async () => {
    try {
      setMetricas(await obtenerMetricas());
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'No se pudieron cargar las métricas de plataforma.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadMetricas);
  }, [loadMetricas]);

  const items = useMemo(
    () => (metricas ? extraerMetricas(metricas).slice(0, 6) : []),
    [metricas],
  );

  return (
    <div className="space-y-7">
      <PageHeader
        title="Resumen de plataforma"
        description="Indicadores generales para supervisar el estado de la plataforma."
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              void loadMetricas();
            }}
          >
            <LuRefreshCw aria-hidden="true" size={15} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
        }
      />

      <section aria-label="Métricas de plataforma">
        {error ? (
          <EmptyState
            title="No se pudieron cargar las métricas"
            description={error}
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsLoading(true);
                  void loadMetricas();
                }}
              >
                Reintentar
              </Button>
            }
          />
        ) : isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-xl border border-zinc-200 bg-white" />
            ))}
          </div>
        ) : items.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const Icon = metricIcon(item.label);
              const value =
                typeof item.value === 'number'
                  ? new Intl.NumberFormat('es-AR').format(item.value)
                  : item.value;
              return (
                <Card key={item.label} className="border-zinc-200/80 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-500">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums">{value}</p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                      <Icon aria-hidden="true" size={19} />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Todavía no hay métricas disponibles"
            description="Cuando la plataforma tenga actividad, vas a ver los indicadores en este resumen."
          />
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden border-zinc-200/80 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                <LuActivity aria-hidden="true" size={13} />
                Centro de operaciones
              </span>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-zinc-950">
                Administrá cada comercio desde un solo lugar
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                Consultá estados y vencimientos, gestioná suscripciones y registrá pagos.
              </p>
            </div>
            <Link
              href="/plataforma/comercios?crear=1"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Ir a comercios
              <LuArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </Card>

        <Card title="Accesos rápidos" subtitle="Tareas de administración">
          <div className="flex flex-col gap-2">
            <Link
              href="/plataforma/comercios?crear=1"
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Registrar un comercio
              <LuArrowUpRight aria-hidden="true" size={15} className="text-zinc-400" />
            </Link>
            <Link
              href="/plataforma/auditoria"
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Revisar auditoría
              <LuArrowUpRight aria-hidden="true" size={15} className="text-zinc-400" />
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
