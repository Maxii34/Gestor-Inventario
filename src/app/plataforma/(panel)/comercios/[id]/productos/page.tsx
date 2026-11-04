'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LuArrowLeft, LuPlus, LuTrash2 } from 'react-icons/lu';
import { Button, Card, FormField, Input, PageHeader } from '@/components';
import { ApiError } from '@/lib/api/client';
import { confirmAction, notifySuccess } from '@/lib/notifications/toast';
import {
  cargarProductosMasivos,
  type ErrorFilaCarga,
  type ProductoMasivoInput,
} from '@/services/plataforma.service';

const FILA_VACIA: ProductoMasivoInput = {
  nombre: '',
  descripcion: '',
  codigoBarras: '',
  precioCompra: 0,
  precioCompraPaquete: 0,
  unidadesPorPaquete: 1,
  precioVenta: 0,
  stock: 0,
  stockMinimo: 0,
  categoria: '',
};

function erroresRespuesta(error: unknown): ErrorFilaCarga[] {
  if (!(error instanceof ApiError) || typeof error.body !== 'object' || error.body === null) return [];
  const data = 'data' in error.body ? error.body.data : null;
  if (typeof data !== 'object' || data === null || !('errores' in data) || !Array.isArray(data.errores)) return [];
  return data.errores.filter(
    (item): item is ErrorFilaCarga =>
      typeof item === 'object' &&
      item !== null &&
      'fila' in item &&
      typeof item.fila === 'number' &&
      'mensaje' in item &&
      typeof item.mensaje === 'string',
  );
}

export default function CargaMasivaProductosPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const comercioId = Number(params.id);
  const [filas, setFilas] = useState<ProductoMasivoInput[]>([{ ...FILA_VACIA }]);
  const [errores, setErrores] = useState<ErrorFilaCarga[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  function actualizarFila(index: number, cambios: Partial<ProductoMasivoInput>): void {
    setFilas((actuales) => actuales.map((fila, i) => i === index ? { ...fila, ...cambios } : fila));
    setErrores([]);
    setError(null);
    setResultado(null);
    setVistaPrevia(false);
  }

  function agregarFila(): void {
    if (filas.length >= 50) return;
    setFilas((actuales) => [...actuales, { ...FILA_VACIA }]);
    setErrores([]);
    setError(null);
    setResultado(null);
    setVistaPrevia(false);
  }

  function quitarFila(index: number): void {
    setFilas((actuales) => actuales.filter((_, i) => i !== index));
    setErrores([]);
    setError(null);
    setResultado(null);
    setVistaPrevia(false);
  }

  async function enviar(simular: boolean): Promise<void> {
    if (!Number.isInteger(comercioId) || comercioId <= 0) {
      setError('El identificador del comercio no es válido.');
      return;
    }
    if (filas.length === 0 || filas.length > 50) {
      setError('Agregá entre 1 y 50 productos.');
      return;
    }
    for (let index = 0; index < filas.length; index += 1) {
      const fila = filas[index];
      const precioUnidad = Number(fila.precioCompra ?? 0);
      const precioPaquete = Number(fila.precioCompraPaquete ?? 0);
      const unidades = Number(fila.unidadesPorPaquete ?? 1);
      if (precioUnidad > 0 && precioPaquete > 0) {
        setErrores([
          {
            fila: index + 1,
            campo: 'precioCompra',
            mensaje: 'Enviá el costo por unidad o el costo del paquete, no ambos',
          },
        ]);
        return;
      }
      if (precioPaquete > 0 && (!Number.isInteger(unidades) || unidades < 1)) {
        setErrores([
          {
            fila: index + 1,
            campo: 'unidadesPorPaquete',
            mensaje:
              'Las unidades por paquete deben ser un entero mayor o igual a 1',
          },
        ]);
        return;
      }
    }
    if (!simular) {
      const confirmado = await confirmAction(
        'Confirmar carga masiva',
        `Se crearán ${filas.length} productos en el comercio. Esta acción no se puede deshacer.`,
        'Confirmar carga',
      );
      if (!confirmado) return;
    }
    setIsLoading(true);
    setError(null);
    setErrores([]);
    setResultado(null);
    try {
      const response = await cargarProductosMasivos(
        comercioId,
        filas.map((fila) => {
          const usaPaquete = Number(fila.precioCompraPaquete ?? 0) > 0;
          return {
            nombre: fila.nombre.trim(),
            ...(fila.descripcion?.trim() ? { descripcion: fila.descripcion.trim() } : {}),
            ...(fila.codigoBarras?.trim() ? { codigoBarras: fila.codigoBarras.trim() } : {}),
            ...(usaPaquete
              ? {
                  precioCompraPaquete: Number(fila.precioCompraPaquete),
                  unidadesPorPaquete: Number(fila.unidadesPorPaquete ?? 1),
                }
              : { precioCompra: Number(fila.precioCompra) }),
            precioVenta: Number(fila.precioVenta),
            stock: Number(fila.stock),
            stockMinimo: Number(fila.stockMinimo),
            categoria: fila.categoria.trim(),
          };
        }),
        simular,
      );
      if (simular) {
        setResultado(`Simulación correcta: ${response.validas ?? 0} productos válidos. No se creó ningún registro.`);
        setVistaPrevia(true);
      } else {
        setResultado(`Se crearon ${response.creados ?? filas.length} productos.`);
        setFilas([{ ...FILA_VACIA }]);
        setVistaPrevia(false);
        notifySuccess('Carga completada', `Se crearon ${response.creados ?? filas.length} productos.`);
      }
    } catch (err) {
      const erroresBackend = erroresRespuesta(err);
      if (erroresBackend.length) {
        setErrores(erroresBackend);
        setVistaPrevia(false);
      } else {
        setError(err instanceof ApiError ? err.message : 'No se pudo procesar la carga.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carga masiva de productos"
        description="Prepará hasta 50 productos, revisá los datos y simulá antes de confirmar."
        actions={<Button type="button" variant="outline" onClick={() => router.push('/plataforma/comercios')}><LuArrowLeft aria-hidden="true" size={15} /> Volver</Button>}
      />
      <Card title="Productos para cargar" subtitle={`${filas.length} de 50 filas`}>
        <div className="space-y-4">
          {filas.map((fila, index) => (
            <section key={index} aria-label={`Producto fila ${index + 1}`} className="space-y-3 rounded-xl border border-zinc-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Producto · fila {index + 1}</h2>
                <Button type="button" variant="ghost" aria-label={`Eliminar fila ${index + 1}`} onClick={() => quitarFila(index)}><LuTrash2 aria-hidden="true" size={16} /> Quitar</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Nombre" htmlFor={`producto-nombre-${index}`}>
                  <Input id={`producto-nombre-${index}`} maxLength={100} value={fila.nombre} onChange={(event) => actualizarFila(index, { nombre: event.target.value })} />
                </FormField>
                <FormField label="Categoría existente" htmlFor={`producto-categoria-${index}`} hint="Escribí el nombre exacto de una categoría del comercio.">
                  <Input id={`producto-categoria-${index}`} maxLength={100} value={fila.categoria} onChange={(event) => actualizarFila(index, { categoria: event.target.value })} />
                </FormField>
                <FormField label="Código de barras (opcional)" htmlFor={`producto-codigo-${index}`}>
                  <Input id={`producto-codigo-${index}`} maxLength={64} value={fila.codigoBarras ?? ''} onChange={(event) => actualizarFila(index, { codigoBarras: event.target.value })} />
                </FormField>
                <FormField label="Precio de compra por unidad" htmlFor={`producto-compra-${index}`} hint="Usá este campo o el precio de la caja, nunca ambos.">
                  <Input id={`producto-compra-${index}`} type="number" min="0" step="0.01" value={fila.precioCompra ?? 0} onChange={(event) => actualizarFila(index, { precioCompra: Number(event.target.value) })} />
                </FormField>
                <FormField label="Unidades por paquete (opcional)" htmlFor={`producto-unidades-${index}`}>
                  <Input id={`producto-unidades-${index}`} type="number" min="1" step="1" value={fila.unidadesPorPaquete ?? 1} onChange={(event) => actualizarFila(index, { unidadesPorPaquete: Number(event.target.value) })} />
                </FormField>
                <FormField label="Precio de la caja (opcional)" htmlFor={`producto-paquete-${index}`} hint="Si lo completás, dejá el precio por unidad en 0.">
                  <Input id={`producto-paquete-${index}`} type="number" min="0" step="0.01" value={fila.precioCompraPaquete ?? 0} onChange={(event) => actualizarFila(index, { precioCompraPaquete: Number(event.target.value) })} />
                </FormField>
                <FormField label="Precio de venta" htmlFor={`producto-venta-${index}`}>
                  <Input id={`producto-venta-${index}`} type="number" min="0.01" step="0.01" value={fila.precioVenta} onChange={(event) => actualizarFila(index, { precioVenta: Number(event.target.value) })} />
                </FormField>
                <FormField label="Stock" htmlFor={`producto-stock-${index}`}>
                  <Input id={`producto-stock-${index}`} type="number" min="0" step="1" value={fila.stock} onChange={(event) => actualizarFila(index, { stock: Number(event.target.value) })} />
                </FormField>
                <FormField label="Stock mínimo" htmlFor={`producto-minimo-${index}`}>
                  <Input id={`producto-minimo-${index}`} type="number" min="0" step="1" value={fila.stockMinimo ?? 0} onChange={(event) => actualizarFila(index, { stockMinimo: Number(event.target.value) })} />
                </FormField>
                <div className="sm:col-span-2 lg:col-span-2">
                  <FormField label="Descripción" htmlFor={`producto-descripcion-${index}`}>
                    <Input id={`producto-descripcion-${index}`} value={fila.descripcion ?? ''} onChange={(event) => actualizarFila(index, { descripcion: event.target.value })} />
                  </FormField>
                </div>
              </div>
              {errores.filter((item) => item.fila === index + 1).map((item, errorIndex) => (
                <p key={errorIndex} role="alert" className="text-sm text-red-700">
                  Fila {item.fila}{item.campo ? ` · ${item.campo}` : ''}: {item.mensaje}
                </p>
              ))}
              {filas.length === 0 && (
                <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
                  No hay filas. Agregá un producto para comenzar.
                </p>
              )}
            </section>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={filas.length >= 50 || isLoading} onClick={agregarFila}><LuPlus aria-hidden="true" size={16} /> Agregar fila</Button>
            <Button type="button" variant="secondary" disabled={isLoading || filas.length === 0} onClick={() => setVistaPrevia(true)}>Vista previa</Button>
            <Button type="button" variant="outline" disabled={isLoading || filas.length === 0} onClick={() => void enviar(true)}>{isLoading ? 'Procesando…' : 'Simular carga'}</Button>
            <Button type="button" disabled={isLoading || filas.length === 0} onClick={() => void enviar(false)}>{isLoading ? 'Procesando…' : 'Confirmar carga'}</Button>
          </div>
        </div>
      </Card>
      {vistaPrevia && (
        <Card title="Vista previa" subtitle="Se enviarán estas filas al comercio seleccionado.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="text-xs text-zinc-500"><tr>{['Nombre', 'Descripción', 'Categoría', 'Código', 'Compra unit.', 'Unidades/paquete', 'Precio caja', 'Venta', 'Stock', 'Stock mínimo'].map((titulo) => <th key={titulo} className="px-2 py-2">{titulo}</th>)}</tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {filas.map((fila, index) => <tr key={index}>
                  <td className="px-2 py-2">{fila.nombre || '—'}</td>
                  <td className="px-2 py-2">{fila.descripcion || '—'}</td>
                  <td className="px-2 py-2">{fila.categoria || '—'}</td>
                  <td className="px-2 py-2">{fila.codigoBarras || '—'}</td>
                  <td className="px-2 py-2">{fila.precioCompra ?? 0}</td>
                  <td className="px-2 py-2">{fila.unidadesPorPaquete ?? 1}</td>
                  <td className="px-2 py-2">{fila.precioCompraPaquete ?? 0}</td>
                  <td className="px-2 py-2">{fila.precioVenta}</td>
                  <td className="px-2 py-2">{fila.stock}</td>
                  <td className="px-2 py-2">{fila.stockMinimo ?? 0}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {resultado && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{resultado}</p>}
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
