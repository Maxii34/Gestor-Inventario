'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuFilter,
  LuPackage,
  LuPencil,
  LuPlus,
  LuSearch,
  LuSave,
  LuTrash2,
  LuTriangleAlert,
  LuX,
} from 'react-icons/lu';
import {
  Badge,
  Button,
  Card,
  FormField,
  HelpTooltip,
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
import { useSuscripcion } from '@/context/SuscripcionContext';
import { ApiError } from '@/lib/api/client';
import { cargarTodasLasPaginas } from '@/lib/api/paginacion';
import { notifySuccess } from '@/lib/notifications/toast';
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

function formatoCosto(valor: number | string, maxDecimales = 4): string {
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  const seguro = Number.isFinite(numero) ? numero : 0;
  return `$${seguro.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimales,
  })}`;
}

function unidadesDePaquete(producto: BackendProducto): number {
  const unidades = Number(producto.unidadesPorPaquete ?? 1);
  return Number.isInteger(unidades) && unidades > 0 ? unidades : 1;
}

function calcularMargenBrutoPorcentaje(
  precioVenta: number,
  costoUnitario: number,
): number {
  if (
    !Number.isFinite(precioVenta) ||
    precioVenta <= 0 ||
    !Number.isFinite(costoUnitario)
  )
    return Number.NaN;
  return ((precioVenta - costoUnitario) / precioVenta) * 100;
}

function calcularCostoUnitario(form: FormularioProducto): number {
  if (!form.compraPorPaquete) return Number(form.precioCompra);
  const precioPaquete = Number(form.precioCompraPaquete);
  const unidades = Number(form.unidadesPorPaquete);
  if (
    !Number.isFinite(precioPaquete) ||
    !Number.isInteger(unidades) ||
    unidades < 1
  )
    return Number.NaN;
  const precioPaqueteEnCentavos = Math.round(precioPaquete * 100);
  const costoEnDiezMiles = Math.floor(
    (precioPaqueteEnCentavos * 100) / unidades + 0.5,
  );
  return costoEnDiezMiles / 10000;
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
  codigoBarras: string;
  compraPorPaquete: boolean;
  precioCompra: string;
  precioCompraPaquete: string;
  unidadesPorPaquete: string;
  precioVenta: string;
  margenDeseado: string;
  stock: string;
  stockUnidad: 'unidad' | 'caja';
  stockMinimo: string;
  categoriaId: string;
}

const FORMULARIO_VACIO: FormularioProducto = {
  nombre: '',
  descripcion: '',
  codigoBarras: '',
  compraPorPaquete: false,
  precioCompra: '',
  precioCompraPaquete: '',
  unidadesPorPaquete: '',
  precioVenta: '',
  margenDeseado: '',
  stock: '',
  stockUnidad: 'unidad',
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
  const precioVenta = Number(form.precioVenta);
  const stock = Number(form.stock);
  const stockMinimo = Number(form.stockMinimo);
  if (form.compraPorPaquete) {
    const precioPaquete = Number(form.precioCompraPaquete);
    const unidades = Number(form.unidadesPorPaquete);
    if (!Number.isFinite(precioPaquete) || precioPaquete <= 0)
      return 'El precio de la caja debe ser mayor a 0.';
    if (!Number.isInteger(unidades) || unidades < 1 || unidades > 100000)
      return 'Las unidades por caja deben ser un entero entre 1 y 100.000.';
  } else {
    const precioCompra = Number(form.precioCompra);
    if (!Number.isFinite(precioCompra) || precioCompra <= 0)
      return 'El costo por unidad debe ser mayor a 0.';
  }
  const costoUnitario = calcularCostoUnitario(form);
  if (!Number.isFinite(precioVenta) || precioVenta <= 0)
    return 'El precio de venta debe ser mayor a 0.';
  if (!Number.isFinite(costoUnitario) || precioVenta <= costoUnitario)
    return 'El precio de venta debe ser mayor al costo por unidad.';
  if (!Number.isInteger(stock) || stock < 0)
    return 'El stock debe ser un número entero mayor o igual a 0.';
  if (!Number.isInteger(stockMinimo) || stockMinimo < 0)
    return 'El stock mínimo debe ser un número entero mayor o igual a 0.';
  return null;
}

export default function ProductosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { soloLectura, motivoSoloLectura } = useSuscripcion();
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [codigoBarrasError, setCodigoBarrasError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const codigoBarrasParamHandled = useRef(false);

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
      const productos = await cargarTodasLasPaginas<BackendProducto>('/productos');
      setTodosProductos(productos);
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

  useEffect(() => {
    if (!isAdmin || codigoBarrasParamHandled.current) return;
    const parametros = new URLSearchParams(window.location.search);
    const codigoBarras = parametros.get('codigoBarras');
    if (codigoBarras === null) return;

    codigoBarrasParamHandled.current = true;
    startTransition(() => {
      setEditingId(null);
      setForm({ ...FORMULARIO_VACIO, codigoBarras });
      setFormError(null);
      setCodigoBarrasError(null);
      setIsFormOpen(true);
    });
    router.replace('/productos', { scroll: false });
  }, [isAdmin, router]);

  function setCampo<K extends keyof FormularioProducto>(
    campo: K,
    valor: FormularioProducto[K],
  ): void {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    if (campo === 'codigoBarras') setCodigoBarrasError(null);
  }

  function comenzarEdicion(producto: BackendProducto): void {
    const tienePaquete =
      producto.precioCompraPaquete !== null &&
      producto.precioCompraPaquete !== undefined;
    setEditingId(producto.id);
    setFormError(null);
    setCodigoBarrasError(null);
    setIsFormOpen(true);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      codigoBarras: producto.codigoBarras ?? '',
      compraPorPaquete: tienePaquete,
      precioCompra: String(producto.precioCompra),
      precioCompraPaquete: tienePaquete
        ? String(producto.precioCompraPaquete)
        : '',
      unidadesPorPaquete: tienePaquete
        ? String(unidadesDePaquete(producto))
        : '',
      precioVenta: String(producto.precioVenta),
      margenDeseado: '',
      stock: String(producto.stock),
      stockUnidad: 'unidad',
      stockMinimo: String(producto.stockMinimo),
      categoriaId: String(producto.categoriaId),
    });
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setIsFormOpen(false);
    setForm(FORMULARIO_VACIO);
    setFormError(null);
    setCodigoBarrasError(null);
  }

  function nuevoProducto(): void {
    cancelarEdicion();
    if (categorias.length === 0) void cargarCategorias();
    setIsFormOpen(true);
  }

  async function guardarProducto(): Promise<void> {
    if (isSubmitting) return;
    const codigoBarras = form.codigoBarras.trim();
    if (
      codigoBarras &&
      (codigoBarras.length > 64 || !/^[\x21-\x7E]+$/.test(codigoBarras))
    ) {
      setCodigoBarrasError(
        codigoBarras.length > 64
          ? 'El código de barras no puede superar los 64 caracteres.'
          : 'El código de barras solo puede contener caracteres imprimibles sin espacios.',
      );
      return;
    }
    const validacion = validarFormulario(form);
    if (validacion) {
      setFormError(validacion);
      return;
    }
    setFormError(null);
    setCodigoBarrasError(null);
    setIsSubmitting(true);
    try {
      const esEdicion = editingId !== null;
      const unidadesPaquete = form.compraPorPaquete
        ? Number(form.unidadesPorPaquete)
        : 1;
      const stockIngresado = Number(form.stock);
      const stock =
        !esEdicion && form.stockUnidad === 'caja'
          ? stockIngresado * unidadesPaquete
          : stockIngresado;
      const costos = form.compraPorPaquete
        ? {
            precioCompraPaquete: Number(form.precioCompraPaquete),
            unidadesPorPaquete: unidadesPaquete,
          }
        : {
            precioCompra: Number(form.precioCompra),
            ...(esEdicion ? { unidadesPorPaquete: 1 } : {}),
          };
      const input = {
        nombre: form.nombre.trim(),
        ...(form.descripcion.trim() ? { descripcion: form.descripcion.trim() } : {}),
        ...costos,
        precioVenta: Number(form.precioVenta),
        stock,
        stockMinimo: Number(form.stockMinimo),
        categoriaId: Number(form.categoriaId),
      };
      if (!esEdicion) {
        await crearProducto({
          ...input,
          ...(codigoBarras ? { codigoBarras } : {}),
        });
      } else {
        await actualizarProducto(editingId, {
          ...input,
          codigoBarras: codigoBarras || null,
        });
      }
      notifySuccess(
        esEdicion ? 'Producto actualizado' : 'Producto agregado',
        `"${input.nombre}" ya está en tu catálogo.`,
      );
      cancelarEdicion();
      if (hayFiltros) {
        await cargarTodoParaFiltrar();
      } else {
        await cargarPagina(page);
      }
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 409 ||
          (err.status === 400 && /c[oó]digo de barras/i.test(err.message)))
      ) {
        setCodigoBarrasError(err.message);
      } else {
        setFormError(
          err instanceof ApiError
            ? err.message
            : 'No pudimos guardar el producto. Inténtalo nuevamente.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmarEliminacion(): Promise<void> {
    if (!deleteTarget || isDeleting) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const nombreProducto = deleteTarget.nombre;
      await eliminarProducto(deleteTarget.id);
      notifySuccess('Producto eliminado', `"${nombreProducto}" se quitó del catálogo.`);
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
      if (
        texto &&
        !producto.nombre.toLowerCase().includes(texto) &&
        !producto.codigoBarras?.toLowerCase().includes(texto)
      ) {
        return false;
      }
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

  const costoUnitarioFormulario = calcularCostoUnitario(form);
  const precioVentaNumero = Number(form.precioVenta);
  const margenMonto =
    Number.isFinite(costoUnitarioFormulario) && Number.isFinite(precioVentaNumero)
      ? precioVentaNumero - costoUnitarioFormulario
      : Number.NaN;
  const margenPorcentaje =
    calcularMargenBrutoPorcentaje(precioVentaNumero, costoUnitarioFormulario);
  const unidadesPaqueteFormulario = form.compraPorPaquete
    ? Number(form.unidadesPorPaquete)
    : 1;
  const mostrarSelectorStock =
    editingId === null &&
    Number.isInteger(unidadesPaqueteFormulario) &&
    unidadesPaqueteFormulario > 1;
  const stockEnUnidadesFormulario =
    Number(form.stock) *
    (mostrarSelectorStock && form.stockUnidad === 'caja'
      ? unidadesPaqueteFormulario
      : 1);

  function aplicarMargenDeseado(valor: string): void {
    setCampo('margenDeseado', valor);
    const margen = Number(valor);
    if (
      !Number.isFinite(margen) ||
      !Number.isFinite(costoUnitarioFormulario) ||
      costoUnitarioFormulario <= 0
    )
      return;
    setCampo('precioVenta', (costoUnitarioFormulario * (1 + margen / 100)).toFixed(2));
  }

  const columnas: TableColumn<BackendProducto>[] = [
    {
      key: 'nombre',
      header: '# Producto',
      render: (row) => (
        <div className="min-w-40">
          <p className="font-semibold text-zinc-900">{row.nombre}</p>
          {row.codigoBarras && (
            <p className="mt-0.5 text-xs text-zinc-500">
              Código de barras: {row.codigoBarras}
            </p>
          )}
          {row.descripcion && (
            <p className="mt-0.5 max-w-64 truncate text-xs text-zinc-500" title={row.descripcion}>
              {row.descripcion}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'categoria',
      header: '# Categoría',
      render: (row) => (
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
          {row.categoria?.nombre ?? 'Sin categoría'}
        </span>
      ),
    },
    {
      key: 'costo',
      header: '# Costo unitario',
      align: 'right',
      render: (row) => {
        const tienePaquete =
          row.precioCompraPaquete !== null &&
          row.precioCompraPaquete !== undefined;
        return (
          <div className="text-right">
            <p className="font-medium text-zinc-700 tabular-nums">
              {formatoCosto(row.precioCompra, 2)}
            </p>
            {tienePaquete && (
              <p className="mt-0.5 text-xs text-zinc-500">
                caja de {unidadesDePaquete(row)} unidades a{' '}
                {formatoCosto(row.precioCompraPaquete ?? 0, 2)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'precioVenta',
      header: '# Precio venta',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <p className="font-semibold text-zinc-900">{formatoMoneda(row.precioVenta)}</p>
          {isAdmin && Number(row.precioVenta) > 0 && (
            <p className="mt-0.5 text-xs text-zinc-500">
              Margen bruto{' '}
              {calcularMargenBrutoPorcentaje(
                Number(row.precioVenta),
                Number(row.precioCompra),
              ).toLocaleString('es-AR', { maximumFractionDigits: 1 })}
              %
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: '# Stock',
      align: 'center',
      render: (row) => {
        const visual = estadoStock(row);
        return (
          <span className="inline-flex min-w-20 flex-col items-center gap-1">
            <span className="text-base font-semibold tabular-nums">{row.stock}</span>
            <Badge tone={visual.tono} size="sm">{visual.etiqueta}</Badge>
          </span>
        );
      },
    },
    {
      key: 'stockMinimo',
      header: '# Mínimo',
      align: 'center',
      render: (row) => <span className="text-zinc-600 tabular-nums">{row.stockMinimo}</span>,
    },
    {
      key: 'activo',
      header: '# Estado',
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
            variant="action"
            size="sm"
            aria-label={`Editar ${row.nombre}`}
            onClick={() => comenzarEdicion(row)}
            disabled={soloLectura}
            title={soloLectura ? motivoSoloLectura : undefined}
          >
            <LuPencil aria-hidden="true" size={14} />
            Editar
          </Button>
          <Button
            type="button"
            variant="actionDanger"
            size="sm"
            aria-label={`Eliminar ${row.nombre}`}
            onClick={() => {
              setDeleteError(null);
              setDeleteTarget(row);
            }}
            disabled={soloLectura}
            title={soloLectura ? motivoSoloLectura : undefined}
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
        description="Encontrá productos, revisá existencias y mantené actualizado tu catálogo."
        actions={
          isAdmin ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={nuevoProducto}
              disabled={soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
            >
              <LuPlus aria-hidden="true" size={16} />
              Nuevo producto
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-5">
        <section
          aria-label="Resumen del catálogo"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
        >
          <Card className="border-zinc-200/80 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:h-10 sm:w-10">
                <LuPackage aria-hidden="true" size={19} />
              </span>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">Productos</p>
                  <HelpTooltip text="Cantidad total de productos registrados en el catálogo, incluidos los inactivos." />
                </div>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                  {meta.total.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-zinc-200/80 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 sm:h-10 sm:w-10">
                <LuFilter aria-hidden="true" size={18} />
              </span>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">Categorías</p>
                  <HelpTooltip text="Cantidad total de categorías disponibles para organizar productos." />
                </div>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                  {categorias.length.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-zinc-200/80 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 sm:h-10 sm:w-10">
                <LuTriangleAlert aria-hidden="true" size={19} />
              </span>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">
                    Stock bajo
                  </p>
                  <HelpTooltip text="Productos de esta página que tienen stock igual o menor al mínimo configurado." />
                </div>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                  {isLoading || isFiltering
                    ? '—'
                    : filasTabla.filter((producto) => estadoStock(producto).etiqueta === 'Stock bajo').length}
                </p>
              </div>
            </div>
          </Card>
        </section>

        <Reveal delay={0}>
        <Card
          title="Encontrar un producto"
          subtitle="Buscá por nombre y combiná los filtros para acotar resultados."
          actions={<LuSearch aria-hidden="true" size={17} className="text-zinc-400" />}
          className="border-zinc-200/80 shadow-sm"
        >
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <SearchInput
              id="buscar-producto"
              label="Nombre del producto"
              placeholder="Ej. Yerba, aceite, arroz…"
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
              label="Disponibilidad"
              value={filtroEstado}
              onChange={(event) => {
                setFiltroEstado(event.target.value);
                setPage(1);
              }}
              options={ESTADO_OPCIONES}
            />
          </div>
          {hayFiltros && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
              <p className="text-xs text-zinc-500">
                Filtros activos · {productosFiltrados.length}{' '}
                {productosFiltrados.length === 1 ? 'resultado' : 'resultados'}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusqueda('');
                  setFiltroCategoria('todas');
                  setFiltroEstado('todos');
                  setPage(1);
                }}
              >
                <LuX aria-hidden="true" size={14} />
                Limpiar filtros
              </Button>
            </div>
          )}
        </Card>
        </Reveal>

        <Reveal delay={0.05}>
        <Card
          title="Catálogo"
          subtitle={
            hayFiltros
              ? `${productosFiltrados.length.toLocaleString('es-AR')} resultados para tu búsqueda`
              : `${meta.total.toLocaleString('es-AR')} productos registrados`
          }
          actions={
            <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:inline-flex">
              <LuPackage aria-hidden="true" size={15} />
              {hayFiltros ? 'Vista filtrada' : 'Todos los productos'}
            </span>
          }
          className="border-zinc-200/80 shadow-sm"
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
                  {hayFiltros
                    ? `${productosFiltrados.length === 0 ? 0 : (paginaVisible - 1) * PAGE_SIZE + 1}–${Math.min(paginaVisible * PAGE_SIZE, productosFiltrados.length)} de ${productosFiltrados.length}`
                    : `Página ${paginaVisible} de ${totalPaginasVisibles} · ${meta.total} productos`}
                </p>
                <Pagination
                  page={paginaVisible}
                  totalPages={totalPaginasVisibles}
                  onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
                  compactOnMobile
                />
              </div>
            </>
          )}
        </Card>
        </Reveal>

        {isAdmin && (
          <Modal
            open={isFormOpen}
            title={editingId === null ? 'Agregar producto' : 'Editar producto'}
            description={
              editingId === null
                ? 'Completá la información para incorporarlo al catálogo.'
                : 'Actualizá los datos del producto y guardá los cambios.'
            }
            size="lg"
            onClose={() => {
              if (!isSubmitting) cancelarEdicion();
            }}
            footer={
              <>
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={cancelarEdicion}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="producto-formulario"
                  disabled={isSubmitting || soloLectura}
                  title={soloLectura ? motivoSoloLectura : undefined}
                >
                  <LuSave aria-hidden="true" size={16} />
                  {isSubmitting
                    ? 'Guardando…'
                    : editingId === null
                      ? 'Agregar al catálogo'
                      : 'Guardar cambios'}
                </Button>
              </>
            }
          >
            <form
              id="producto-formulario"
              onSubmit={(event) => {
                event.preventDefault();
                void guardarProducto();
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <FormField label="Nombre" htmlFor="producto-nombre">
                <Input
                  id="producto-nombre"
                  placeholder="Ej: Notebook Lenovo IdeaPad"
                  autoFocus
                  required
                  value={form.nombre}
                  onChange={(event) => setCampo('nombre', event.target.value)}
                />
              </FormField>
              <FormField label="Categoría" htmlFor="producto-categoria">
                <Select
                  id="producto-categoria"
                  value={form.categoriaId}
                  onChange={(event) => setCampo('categoriaId', event.target.value)}
                  required
                  placeholder="Seleccionar categoría"
                  options={categorias.map((categoria) => ({
                    value: String(categoria.id),
                    label: categoria.nombre,
                  }))}
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Descripción" htmlFor="producto-descripcion">
                  <Input
                    id="producto-descripcion"
                    placeholder="Descripción breve del producto (opcional)"
                    value={form.descripcion}
                    onChange={(event) => setCampo('descripcion', event.target.value)}
                  />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField
                  label="Código de barras"
                  htmlFor="producto-codigo-barras"
                  error={codigoBarrasError ?? undefined}
                  hint="Escaneá el código con el lector o escribilo"
                >
                  <Input
                    id="producto-codigo-barras"
                    placeholder="Opcional"
                    value={form.codigoBarras}
                    aria-invalid={Boolean(codigoBarrasError)}
                    onChange={(event) => setCampo('codigoBarras', event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') return;
                      event.preventDefault();
                      event.stopPropagation();
                      setCampo('codigoBarras', event.currentTarget.value.trim());
                    }}
                  />
                </FormField>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      Lo compro por caja o pack
                    </p>
                    <p className="text-xs text-zinc-500">
                      Cargá el precio de la caja y el sistema calcula el costo por unidad.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.compraPorPaquete}
                    aria-label="Lo compro por caja o pack"
                    onClick={() => {
                      setForm((anterior) => ({
                        ...anterior,
                        compraPorPaquete: !anterior.compraPorPaquete,
                        stockUnidad: 'unidad',
                      }));
                      setFormError(null);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      form.compraPorPaquete ? 'bg-zinc-900' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        form.compraPorPaquete ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
              {form.compraPorPaquete ? (
                <>
                  <FormField label="Precio de la caja" htmlFor="producto-precio-paquete">
                    <Input
                      id="producto-precio-paquete"
                      type="number"
                      min={0.01}
                      step="0.01"
                      required
                      placeholder="0"
                      value={form.precioCompraPaquete}
                      onChange={(event) =>
                        setCampo('precioCompraPaquete', event.target.value)
                      }
                    />
                  </FormField>
                  <FormField
                    label="Unidades por caja"
                    htmlFor="producto-unidades-paquete"
                  >
                    <Input
                      id="producto-unidades-paquete"
                      type="number"
                      min={1}
                      max={100000}
                      step={1}
                      required
                      placeholder="1"
                      value={form.unidadesPorPaquete}
                      onChange={(event) =>
                        setCampo('unidadesPorPaquete', event.target.value)
                      }
                    />
                  </FormField>
                  <FormField
                    label="Costo por unidad"
                    htmlFor="producto-costo-calculado"
                    hint="Calculado automáticamente desde la caja"
                  >
                    <div
                      id="producto-costo-calculado"
                      className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 tabular-nums"
                    >
                      {Number.isFinite(costoUnitarioFormulario) &&
                      costoUnitarioFormulario > 0
                        ? formatoCosto(costoUnitarioFormulario)
                        : '—'}
                    </div>
                  </FormField>
                </>
              ) : (
                <FormField label="Costo por unidad" htmlFor="producto-precio-compra">
                  <Input
                    id="producto-precio-compra"
                    type="number"
                    min={0.01}
                    step="0.0001"
                    required
                    placeholder="0"
                    value={form.precioCompra}
                    onChange={(event) => setCampo('precioCompra', event.target.value)}
                  />
                </FormField>
              )}
              <FormField label="Precio venta" htmlFor="producto-precio-venta">
                <Input
                  id="producto-precio-venta"
                  type="number"
                  min={0.01}
                  step="0.01"
                  required
                  placeholder="0"
                  value={form.precioVenta}
                  onChange={(event) => setCampo('precioVenta', event.target.value)}
                />
              </FormField>
              <FormField
                label="Margen deseado %"
                htmlFor="producto-margen-deseado"
                hint="Sugiere el precio de venta sobre el costo"
              >
                <Input
                  id="producto-margen-deseado"
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="Opcional"
                  value={form.margenDeseado}
                  onChange={(event) => aplicarMargenDeseado(event.target.value)}
                />
              </FormField>
              <div
                role="status"
                className={`sm:col-span-2 rounded-lg border px-3 py-2 text-xs ${
                  Number.isFinite(margenMonto) && margenMonto > 0
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                {Number.isFinite(costoUnitarioFormulario) &&
                costoUnitarioFormulario > 0 &&
                Number.isFinite(precioVentaNumero) &&
                precioVentaNumero > 0 ? (
                  <>
                    Costo por unidad:{' '}
                    <strong>{formatoCosto(costoUnitarioFormulario)}</strong>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    Margen:{' '}
                    <strong>{formatoCosto(margenMonto, 2)}</strong>
                    {Number.isFinite(margenPorcentaje) && (
                      <> ({margenPorcentaje.toLocaleString('es-AR', {
                        maximumFractionDigits: 1,
                      })}%)</>
                    )}
                    {margenMonto <= 0 && (
                      <span className="ml-2 font-semibold">
                        El precio de venta no supera el costo.
                      </span>
                    )}
                  </>
                ) : (
                  'Completá el costo y el precio de venta para ver el margen.'
                )}
              </div>
              <FormField
                label={editingId === null ? 'Stock inicial' : 'Stock'}
                htmlFor="producto-stock"
              >
                <Input
                  id="producto-stock"
                  type="number"
                  min={0}
                  step={1}
                  required
                  placeholder="0"
                  value={form.stock}
                  onChange={(event) => setCampo('stock', event.target.value)}
                />
              </FormField>
              {mostrarSelectorStock && (
                <FormField
                  label="Cargar stock en"
                  htmlFor="producto-stock-unidad"
                  hint={
                    form.stockUnidad === 'caja'
                      ? `= ${stockEnUnidadesFormulario} unidades`
                      : 'El stock se guarda siempre en unidades'
                  }
                >
                  <Select
                    id="producto-stock-unidad"
                    value={form.stockUnidad}
                    onChange={(event) =>
                      setCampo(
                        'stockUnidad',
                        event.target.value as FormularioProducto['stockUnidad'],
                      )
                    }
                    options={[
                      { value: 'unidad', label: 'Unidades' },
                      { value: 'caja', label: 'Cajas' },
                    ]}
                  />
                </FormField>
              )}
              <FormField label="Stock mínimo" htmlFor="producto-stock-minimo">
                <Input
                  id="producto-stock-minimo"
                  type="number"
                  min={0}
                  step={1}
                  required
                  placeholder="0"
                  value={form.stockMinimo}
                  onChange={(event) => setCampo('stockMinimo', event.target.value)}
                />
              </FormField>
            {categoriasError && (
              <p role="alert" className="sm:col-span-2 mt-2 text-xs text-red-600">
                {categoriasError}
              </p>
            )}
            {formError && (
              <p role="alert" className="sm:col-span-2 mt-2 text-sm text-red-600">
                {formError}
              </p>
            )}
            </form>
          </Modal>
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
              disabled={isDeleting || soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
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
