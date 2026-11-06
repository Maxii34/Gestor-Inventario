'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { LuActivity, LuFilter, LuRefreshCw } from 'react-icons/lu';
import { Badge, Button, Card, EmptyState, Input, PageHeader, Table, type TableColumn } from '@/components';
import { Pagination } from '@/components/tables';
import { ApiError } from '@/lib/api/client';
import { listarAuditoria, type PlataformaAuditoria } from '@/services/plataforma.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;

function mostrarFecha(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Argentina/Buenos_Aires',
      }).format(date);
}

function mostrarActor(entry: PlataformaAuditoria): string {
  const value = entry.usuario;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return value.nombre || value.email || '—';
  return entry.superadminId ? `Superadmin #${entry.superadminId}` : '—';
}

function mostrarComercio(entry: PlataformaAuditoria): string {
  if (typeof entry.comercio === 'string') return entry.comercio;
  if (entry.comercio && typeof entry.comercio === 'object') {
    return entry.comercio.nombre || (entry.comercio.id ? `#${entry.comercio.id}` : '—');
  }
  return entry.comercioId ? `#${entry.comercioId}` : 'Plataforma';
}

export default function PlataformaAuditoriaPage() {
  const [eventos, setEventos] = useState<PlataformaAuditoria[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [comercioId, setComercioId] = useState('');
  const [appliedComercioId, setAppliedComercioId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    try {
      const result = await listarAuditoria({
        page,
        limit: PAGE_SIZE,
        comercioId: appliedComercioId || undefined,
      });
      setEventos(result.eventos);
      setMeta(result.meta);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'No se pudo cargar el registro de auditoría.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [appliedComercioId, page]);

  useEffect(() => {
    void Promise.resolve().then(loadAudit);
  }, [loadAudit]);

  function applyFilter(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalized = comercioId.trim();
    if (normalized && (!/^\d+$/.test(normalized) || Number(normalized) < 1)) {
      setError('El ID del comercio debe ser un entero positivo.');
      return;
    }
    setIsLoading(true);
    setPage(1);
    setAppliedComercioId(normalized);
  }

  function changePage(nextPage: number): void {
    setIsLoading(true);
    setPage(nextPage);
  }

  const columns: TableColumn<PlataformaAuditoria>[] = [
    {
      key: 'fecha',
      header: 'Fecha y hora',
      render: (entry) => (
        <span className="whitespace-nowrap text-zinc-600">
          {mostrarFecha(entry.fecha ?? entry.fechaCreacion ?? entry.createdAt)}
        </span>
      ),
    },
    {
      key: 'accion',
      header: 'Acción',
      render: (entry) => {
        const action = entry.accion || entry.evento || entry.descripcion || 'Actividad';
        return (
          <div className="max-w-sm">
            <p className="font-medium text-zinc-900">{action}</p>
            {entry.descripcion && entry.descripcion !== action && (
              <p className="mt-1 text-xs text-zinc-500">{entry.descripcion}</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'comercio',
      header: 'Comercio',
      render: (entry) => <Badge tone={entry.comercioId ? 'info' : 'neutral'}>{mostrarComercio(entry)}</Badge>,
    },
    {
      key: 'actor',
      header: 'Realizado por',
      render: (entry) => <span className="text-zinc-600">{mostrarActor(entry)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoría"
        description="Historial de acciones realizadas en la plataforma y sus comercios."
        actions={
          <Button type="button" variant="outline" onClick={() => {
            setIsLoading(true);
            void loadAudit();
          }} disabled={isLoading}>
            <LuRefreshCw aria-hidden="true" size={15} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
        }
      />

      <Card className="border-zinc-200/80 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Registro de actividad</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {meta.total} {meta.total === 1 ? 'evento' : 'eventos'} registrados
            </p>
          </div>
          <form onSubmit={applyFilter} className="flex items-end gap-2">
            <Input
              label="Filtrar por ID de comercio"
              type="number"
              min={1}
              step={1}
              value={comercioId}
              onChange={(event) => setComercioId(event.target.value)}
              placeholder="Ej. 12"
            />
            <Button type="submit" variant="secondary">
              <LuFilter aria-hidden="true" size={15} />
              Filtrar
            </Button>
          </form>
        </div>

        {error ? (
          <EmptyState
            title="No se pudo cargar la auditoría"
            description={error}
            action={<Button type="button" variant="outline" onClick={() => {
              setIsLoading(true);
              void loadAudit();
            }}>Reintentar</Button>}
          />
        ) : isLoading ? (
          <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-zinc-500">
            <LuActivity aria-hidden="true" className="animate-pulse" size={17} />
            Cargando actividad…
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={eventos}
              getRowKey={(entry, index) => `${entry.id}-${index}`}
              emptyMessage="No hay eventos de auditoría para este filtro."
            />
            <div className="mt-4 flex flex-col justify-between gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center">
              <p className="text-xs text-zinc-500">
                Página {meta.page || page} de {meta.totalPaginas || 1}
              </p>
              <Pagination
                page={page}
                totalPages={meta.totalPaginas || 1}
                disabled={isLoading}
                onPageChange={changePage}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
