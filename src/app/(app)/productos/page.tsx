'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LuFilter, LuPencil, LuPlus, LuSave, LuTrash2 } from 'react-icons/lu';
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Table,
  type TableColumn,
} from '@/components';
import { Reveal } from '@/components/motion';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarCategorias,
  listarProductos,
  type BackendCategoria,
  type BackendProducto,
} from '@/services/productos.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'stock-bajo', label: 'Stock bajo' },
  { value: 'sin-stock', label: 'Sin stock' },
];

type EstadoStockEtiqueta = 'Disponible' | 'Stock bajo' | 'Sin stock';

function formatoMoneda(valor: number | string): string {
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  const seguro = Number.isFinite(numero) ? numero : 0;
  return `$${seguro.toLocaleString('es-AR')}`;
}

function estadoStock(producto: BackendProducto): {
  etiqueta: EstadoStockEtiqueta;
  tono: 'success' | 'warning' | 'danger';
} {
  if (producto.stock === 0) return { etiqueta: 'Sin stock', tono: 'danger' };
  if (producto.stock <= producto.stockMinimo)
    return { etiqueta: 'Stock bajo', tono: 'warning' };
  return { etiqueta: 'Disponible', tono: 'success' };
}

interface FormularioProducto {
  nombre: string;
  descripcion: string;
  precioCompra: string;
  precioVenta: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
}

const FORMULARIO_VACIO: FormularioProducto = {
  nombre: '',
  descripcion: '',
  precioCompra: '',
  precioVenta: '',
  stock: '',
  stockMinimo: '',
  categoriaId: '',
};

const ESTADO_POR_FILTRO: Record<string, EstadoStockEtiqueta> = {
  disponible: 'Disponible',
  'stock-bajo': 'Stock bajo',
  'sin-stock': 'Sin stock',
};

function validarFormulario(form: FormularioProducto): string | null {
  if (!form.nombre.trim()) return 'El nombre es obligatorio.';
  if (!form.categoriaId) return 'La categoría es obligatoria.';
  const precioCompra = Number(form.precioCompra);
  const precioVenta = Number(form.precioVenta);
  const stock = Number(form.stock);
  const stockMinimo = Number(form.stockMinimo);
  if (!Number.isFinite(precioCompra) || precioCompra <= 0)
    return 'El precio de compra debe ser mayor a 0.';
  if (!Number.isFinite(precioVenta) || precioVenta <= 0)
    return 'El precio de venta debe ser mayor a 0.';
  if (precioVenta <= precioCompra)
    return 'El precio de venta debe ser mayor al de compra.';
  if (!Number.isInteger(stock) || stock < 0)
    return 'El stock debe ser un número entero mayor o igual a 0.';
  if (!Number.isInteger(stockMinimo) || stockMinimo < 0)
    return 'El stock mínimo debe ser un número entero mayor o igual a 0.';
  return null;
}

export default function ProductosPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const [productos, setProductos] = useState<BackendProducto[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<BackendCategoria[]>([]);
  const [categoriasError, setCategoriasError] = useState<string | null>(null);

  const [form, setForm] = useState<FormularioProducto>(FORMULARIO_VACIO);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BackendProducto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [todosProductos, setTodosProductos] = useState<BackendProducto[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  const hayFiltros =
    busqueda.trim() !== '' || filtroCategoria !== 'todas' || filtroEstado !== 'todos';

  const cargarPagina = useCallback(async (pagina: number): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      const resultado = await listarProductos(pagina, PAGE_SIZE);
      setProductos(resultado.productos);
      setMeta(resultado.meta);
    } catch (err) {
      setProductos([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar los productos. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarCategorias = useCallback(async (): Promise<void> => {
    setCategoriasError(null);
    try {
      setCategorias(await listarCategorias());
    } catch (err) {
      setCategorias([]);
      setCategoriasError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar las categorías.',
      );
    }
  }, []);

  const cargarTodoParaFiltrar = useCallback(async (): Promise<void> => {
    setIsFiltering(true);
    setFilterError(null);
    try {
      const primera = await listarProductos(1, 1);
      if (primera.meta.total === 0) {
        setTodosProductos([]);
        return;
      }
      const completa = await listarProductos(1, primera.meta.total);
      setTodosProductos(completa.productos);
    } catch (err) {
      setTodosProductos([]);
      setFilterError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos aplicar los filtros. Inténtalo nuevamente.',
      );
    } finally {
      setIsFiltering(false);
    }
  }, []);

  useEffect(() => {
    if (hayFiltros) return;
    async function cargarInicial(): Promise<void> {
      await cargarPagina(page);
    }
    void cargarInicial();
  }, [page, hayFiltros, cargarPagina]);

  useEffect(() => {
    if (!hayFiltros) return;
    async function cargarTodo(): Promise<void> {
      await cargarTodoParaFiltrar();
    }
    void cargarTodo();
  }, [hayFiltros, cargarTodoParaFiltrar]);

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      await cargarCategorias();
    }
    void cargarInicial();
  }, [cargarCategorias]);

  function setCampo(campo: keyof FormularioProducto, valor: string): void {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function comenzarEdicion(producto: BackendProducto): void {
    setEditingId(producto.id);
    setFormError(null);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precioCompra: String(producto.precioCompra),
      precioVenta: String(producto.precioVenta),
      stock: String(producto.stock),
      stockMinimo: String(producto.stockMinimo),
      categoriaId: String(producto.categoriaId),
    });
    document.getElementById('producto-formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setForm(FORMULARIO_VACIO);
    setFormError(null);
  }

  function nuevoProducto(): void {
    cancelarEdicion();
    if (categorias.length === 0) void cargarCategorias();
    document.getElementById('producto-formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function guardarProducto(): Promise<void> {
    if (isSubmitting) return;
    const validacion = validarFormulario(form);
    if (validacion) {
      setFormError(validacion);
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const input = {
        nombre: form.nombre.trim(),
        ...(form.descripcion.trim() ? { descripcion: form.descripcion.trim() } : {}),
        precioCompra: Number(form.precioCompra),
        precioVenta: Number(form.precioVenta),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
        categoriaId: Number(form.categoriaId),
      };
      if (editingId === null) {
        await crearProducto(input);
      } else {
        await actualizarProducto(editingId, input);
      }
      cancelarEdicion();
      if (hayFiltros) {
        await cargarTodoParaFiltrar();
      } else {
        await cargarPagina(page);
      }
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos guardar el producto. Inténtalo nuevamente.',
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
      await eliminarProducto(deleteTarget.id);
      setDeleteTarget(null);
      if (hayFiltros) {
        await cargarTodoParaFiltrar();
      } else if (productos.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await cargarPagina(page);
      }
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos eliminar el producto. Inténtalo nuevamente.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const opcionesCategoria = [
    { value: 'todas', label: 'Todas' },
    ...categorias.map((categoria) => ({
      value: String(categoria.id),
      label: categoria.nombre,
    })),
  ];

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return todosProductos.filter((producto) => {
      if (texto && !producto.nombre.toLowerCase().includes(texto)) return false;
      if (filtroCategoria !== 'todas' && producto.categoriaId !== Number(filtroCategoria))
        return false;
      if (filtroEstado !== 'todos' && estadoStock(producto).etiqueta !== ESTADO_POR_FILTRO[filtroEstado])
        return false;
      return true;
    });
  }, [todosProductos, busqueda, filtroCategoria, filtroEstado]);

  const totalPaginasVisibles = hayFiltros
    ? Math.max(1, Math.ceil(productosFiltrados.length / PAGE_SIZE))
    : meta.totalPaginas;
  const paginaVisible = hayFiltros ? Math.min(page, totalPaginasVisibles) : meta.page;
  const filasTabla = hayFiltros
    ? productosFiltrados.slice((paginaVisible - 1) * PAGE_SIZE, paginaVisible * PAGE_SIZE)
    : productos;

  const columnas: TableColumn<BackendProducto>[] = [
    {
      key: 'nombre',
      header: 'Producto',
      render: (row) => (
        <span className="block font-medium text-zinc-900">{row.nombre}</span>
      ),
    },
    { key: 'categoria', header: 'Categoría', render: (row) => row.categoria?.nombre ?? '—' },
    {
      key: 'precioVenta',
      header: 'Precio venta',
      align: 'right',
      render: (row) => formatoMoneda(row.precioVenta),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'center',
      render: (row) => {
        const visual = estadoStock(row);
        return (
          <span className="inline-flex flex-col items-center gap-1">
            <span className="font-medium">{row.stock}</span>
            <Badge tone={visual.tono} size="sm">
              {visual.etiqueta}
            </Badge>
          </span>
        );
      },
    },
    { key: 'stockMinimo', header: 'Stock mínimo', align: 'center' },
    {
      key: 'activo',
      header: 'Estado',
      render: (row) => (
        <Badge tone={row.activo ? 'success' : 'neutral'}>
          {row.activo ? 'Activo' : 'Inactivo'}
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
            <LuPencil aria-hidden="true" size={14} />
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
            <LuTrash2 aria-hidden="true" size={14} />
            Eliminar
          </Button>
        </span>
      ),
    });
  }

  return (
    <>
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo y controla el stock."
        actions={
          isAdmin ? (
            <Button type="button" className="w-full sm:w-auto" onClick={nuevoProducto}>
              <LuPlus aria-hidden="true" size={16} />
              Nuevo producto
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <Reveal delay={0}>
        <Card
          title="Filtros"
          subtitle="Filtros aplicados sobre los datos cargados"
          actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SearchInput
              id="buscar-producto"
              label="Buscar"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(valor) => {
                setBusqueda(valor);
                setPage(1);
              }}
            />
            <Select
              label="Categoría"
              value={filtroCategoria}
              onChange={(event) => {
                setFiltroCategoria(event.target.value);
                setPage(1);
              }}
              options={opcionesCategoria}
            />
            <Select
              label="Estado"
              value={filtroEstado}
              onChange={(event) => {
                setFiltroEstado(event.target.value);
                setPage(1);
              }}
              options={ESTADO_OPCIONES}
            />
          </div>
        </Card>
        </Reveal>

        <Reveal delay={0.05}>
        <Card
          title="Listado de productos"
          subtitle={
            hayFiltros
              ? `${productosFiltrados.length} productos encontrados`
              : `${meta.total} productos registrados`
          }
        >
          {isLoading || isFiltering ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
              ))}
              <span className="sr-only">Cargando productos…</span>
            </div>
          ) : hayFiltros && filterError ? (
            <div>
              <p className="text-sm text-zinc-500">{filterError}</p>
              <div className="mt-4">
                <Button type="button" onClick={() => void cargarTodoParaFiltrar()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : !hayFiltros && listError ? (
            <div>
              <p className="text-sm text-zinc-500">{listError}</p>
              <div className="mt-4">
                <Button type="button" onClick={() => void cargarPagina(page)}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table
                columns={columnas}
                data={filasTabla}
                getRowKey={(row) => row.id}
                emptyMessage={
                  hayFiltros
                    ? 'Sin resultados para los filtros aplicados.'
                    : 'Sin productos para mostrar.'
                }
              />
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-zinc-500">
                  Página {paginaVisible} de {totalPaginasVisibles}
                </p>
                <Pagination
                  page={paginaVisible}
                  totalPages={totalPaginasVisibles}
                  onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
                />
              </div>
            </>
          )}
        </Card>
        </Reveal>

        {isAdmin && (
          <Reveal delay={0.1}>
          <Card
            title={editingId === null ? 'Nuevo producto' : 'Editar producto'}
            subtitle="Formulario conectado al backend"
          >
            <div id="producto-formulario" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Nombre" htmlFor="producto-nombre">
                <Input
                  id="producto-nombre"
                  placeholder="Ej: Notebook Lenovo IdeaPad"
                  value={form.nombre}
                  onChange={(event) => setCampo('nombre', event.target.value)}
                />
              </FormField>
              <FormField label="Categoría" htmlFor="producto-categoria">
                <Select
                  id="producto-categoria"
                  value={form.categoriaId}
                  onChange={(event) => setCampo('categoriaId', event.target.value)}
                  placeholder="Seleccionar categoría"
                  options={categorias.map((categoria) => ({
                    value: String(categoria.id),
                    label: categoria.nombre,
                  }))}
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Descripción" htmlFor="producto-descripcion">
                  <Input
                    id="producto-descripcion"
                    placeholder="Descripción breve del producto (opcional)"
                    value={form.descripcion}
                    onChange={(event) => setCampo('descripcion', event.target.value)}
                  />
                </FormField>
              </div>
              <FormField label="Precio compra" htmlFor="producto-precio-compra">
                <Input
                  id="producto-precio-compra"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.precioCompra}
                  onChange={(event) => setCampo('precioCompra', event.target.value)}
                />
              </FormField>
              <FormField label="Precio venta" htmlFor="producto-precio-venta">
                <Input
                  id="producto-precio-venta"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.precioVenta}
                  onChange={(event) => setCampo('precioVenta', event.target.value)}
                />
              </FormField>
              <FormField label="Stock" htmlFor="producto-stock">
                <Input
                  id="producto-stock"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={form.stock}
                  onChange={(event) => setCampo('stock', event.target.value)}
                />
              </FormField>
              <FormField label="Stock mínimo" htmlFor="producto-stock-minimo">
                <Input
                  id="producto-stock-minimo"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={form.stockMinimo}
                  onChange={(event) => setCampo('stockMinimo', event.target.value)}
                />
              </FormField>
            </div>
            {categoriasError && (
              <p className="mt-2 text-xs text-red-600">{categoriasError}</p>
            )}
            {formError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {formError}
              </p>
            )}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={cancelarEdicion}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void guardarProducto()} disabled={isSubmitting}>
                <LuSave aria-hidden="true" size={16} />
                {isSubmitting
                  ? 'Guardando…'
                  : editingId === null
                    ? 'Crear producto'
                    : 'Guardar cambios'}
              </Button>
            </div>
          </Card>
          </Reveal>
        )}
      </div>

      <Modal
        open={deleteTarget !== null}
        title="Eliminar producto"
        description={
          deleteTarget
            ? `¿Eliminar "${deleteTarget.nombre}" del catálogo? Esta acción no se puede deshacer.`
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
            El producto se eliminará definitivamente del sistema.
          </p>
        )}
      </Modal>
    </>
  );
}
