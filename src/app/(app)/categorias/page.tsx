'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Table,
  type TableColumn,
} from '@/components';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  type BackendCategoria,
} from '@/services/categorias.service';

export default function CategoriasPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const [categorias, setCategorias] = useState<BackendCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BackendCategoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const cargarListado = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      setCategorias(await listarCategorias());
    } catch (err) {
      setCategorias([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar las categorías. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      await cargarListado();
    }
    void cargarInicial();
  }, [cargarListado]);

  const total = categorias.length;
  const activas = categorias.filter((categoria) => categoria.activo).length;

  function comenzarEdicion(categoria: BackendCategoria): void {
    setEditingId(categoria.id);
    setFormError(null);
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion ?? '');
    document.getElementById('categoria-formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setNombre('');
    setDescripcion('');
    setFormError(null);
  }

  function nuevaCategoria(): void {
    cancelarEdicion();
    document.getElementById('categoria-formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function guardarCategoria(): Promise<void> {
    if (isSubmitting) return;
    if (!nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const input = {
        nombre: nombre.trim(),
        ...(descripcion.trim() ? { descripcion: descripcion.trim() } : {}),
      };
      if (editingId === null) {
        await crearCategoria(input);
      } else {
        await actualizarCategoria(editingId, input);
      }
      cancelarEdicion();
      await cargarListado();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos guardar la categoría. Inténtalo nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmarEliminacion(): Promise<void> {
    if (!deleteTarget || isDeleting) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await eliminarCategoria(deleteTarget.id);
      setDeleteTarget(null);
      await cargarListado();
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos eliminar la categoría. Inténtalo nuevamente.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columnas: TableColumn<BackendCategoria>[] = [
    { key: 'nombre', header: 'Categoría' },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (row) => row.descripcion?.trim() || '—',
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (row) => (
        <Badge tone={row.activo ? 'success' : 'neutral'}>
          {row.activo ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
  ];

  if (isAdmin) {
    columnas.push({
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <span className="inline-flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Editar ${row.nombre}`}
            onClick={() => comenzarEdicion(row)}
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Eliminar ${row.nombre}`}
            onClick={() => {
              setDeleteError(null);
              setDeleteTarget(row);
            }}
          >
            Eliminar
          </Button>
        </span>
      ),
    });
  }

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organiza y administra las categorías de tus productos."
        actions={
          isAdmin ? (
            <Button type="button" className="w-full sm:w-auto" onClick={nuevaCategoria}>
              Nueva categoría
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card title="Total de categorías">
            <p className="text-2xl font-bold text-zinc-900">{total}</p>
          </Card>
          <Card title="Categorías activas">
            <p className="text-2xl font-bold text-zinc-900">{activas}</p>
          </Card>
          <Card title="Categorías inactivas">
            <p className="text-2xl font-bold text-zinc-900">{total - activas}</p>
          </Card>
        </div>

        <div className="w-full max-w-md">
          <SearchInput
            id="buscar-categoria"
            label="Buscar"
            placeholder="Buscar categoría..."
            value=""
            onChange={() => undefined}
          />
        </div>

        <Card title="Listado de categorías" subtitle={`${total} categorías registradas`}>
          {isLoading ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
              ))}
              <span className="sr-only">Cargando categorías…</span>
            </div>
          ) : listError ? (
            <div>
              <p className="text-sm text-zinc-500">{listError}</p>
              <div className="mt-4">
                <Button type="button" onClick={() => void cargarListado()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <Table
              columns={columnas}
              data={categorias}
              getRowKey={(row) => row.id}
              emptyMessage="Sin categorías para mostrar."
            />
          )}
        </Card>

        {isAdmin && (
          <Card
            title={editingId === null ? 'Nueva categoría' : 'Editar categoría'}
            subtitle="Formulario conectado al backend"
          >
            <div id="categoria-formulario" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Nombre" htmlFor="categoria-nombre">
                <Input
                  id="categoria-nombre"
                  placeholder="Ej: Electrónica"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                />
              </FormField>
              <FormField label="Descripción" htmlFor="categoria-descripcion">
                <Input
                  id="categoria-descripcion"
                  placeholder="Descripción breve (opcional)"
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                />
              </FormField>
            </div>
            {formError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {formError}
              </p>
            )}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={cancelarEdicion}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void guardarCategoria()} disabled={isSubmitting}>
                {isSubmitting
                  ? 'Guardando…'
                  : editingId === null
                    ? 'Crear categoría'
                    : 'Guardar cambios'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Modal
        open={deleteTarget !== null}
        title="Eliminar categoría"
        description={
          deleteTarget
            ? `¿Eliminar "${deleteTarget.nombre}"? Esta acción no se puede deshacer.`
            : undefined
        }
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isDeleting}
              onClick={() => void confirmarEliminacion()}
            >
              {isDeleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </>
        }
      >
        {deleteError ? (
          <p role="alert" className="text-sm text-red-600">
            {deleteError}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Si la categoría tiene productos asociados, el backend rechazará la eliminación.
          </p>
        )}
      </Modal>
    </>
  );
}
