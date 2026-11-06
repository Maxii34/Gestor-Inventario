'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LuArrowLeft, LuPlus, LuTrash2 } from 'react-icons/lu';
import { Button, Card, FormField, Input, PageHeader } from '@/components';
import { ApiError } from '@/lib/api/client';
import { confirmAction, notifySuccess } from '@/lib/notifications/toast';
import {
  cargarCategoriasMasivas,
  type CategoriaMasivaInput,
  type ErrorFilaCarga,
} from '@/services/plataforma.service';

const FILA_VACIA: CategoriaMasivaInput = { nombre: '', descripcion: '' };

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

export default function CargaMasivaCategoriasPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const comercioId = Number(params.id);
  const [filas, setFilas] = useState<CategoriaMasivaInput[]>([{ ...FILA_VACIA }]);
  const [errores, setErrores] = useState<ErrorFilaCarga[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  function actualizarFila(index: number, cambios: Partial<CategoriaMasivaInput>): void {
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
      setError('Agregá entre 1 y 50 categorías.');
      return;
    }
    if (!filas.every((fila) => fila.nombre.trim())) {
      setErrores(filas.flatMap((fila, index) => fila.nombre.trim() ? [] : [{
        fila: index + 1,
        campo: 'nombre',
        mensaje: 'El nombre es obligatorio.',
      }]));
      return;
    }
    if (!simular) {
      const confirmado = await confirmAction(
        'Confirmar carga masiva',
        `Se crearán ${filas.length} categorías en el comercio. Esta acción no se puede deshacer.`,
        'Confirmar carga',
      );
      if (!confirmado) return;
    }
    setIsLoading(true);
    setError(null);
    setErrores([]);
    setResultado(null);
    try {
      const response = await cargarCategoriasMasivas(
        comercioId,
        filas.map((fila) => ({
          nombre: fila.nombre.trim(),
          ...(fila.descripcion?.trim() ? { descripcion: fila.descripcion.trim() } : {}),
        })),
        simular,
      );
      if (simular) {
        setResultado(`Simulación correcta: ${response.validas ?? 0} categorías válidas. No se creó ningún registro.`);
        setVistaPrevia(true);
      } else {
        setResultado(`Se crearon ${response.creados ?? filas.length} categorías.`);
        setFilas([{ ...FILA_VACIA }]);
        setVistaPrevia(false);
        notifySuccess('Carga completada', `Se crearon ${response.creados ?? filas.length} categorías.`);
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
        title="Carga masiva de categorías"
        description="Prepará hasta 50 categorías, revisá la vista previa y simulá antes de confirmar."
        actions={<Button type="button" variant="outline" onClick={() => router.push('/plataforma/comercios')}><LuArrowLeft aria-hidden="true" size={15} /> Volver</Button>}
      />
      <Card title="Categorías para cargar" subtitle={`${filas.length} de 50 filas`}>
        <div className="space-y-3">
          {filas.map((fila, index) => (
            <div key={index} className="grid gap-3 rounded-xl border border-zinc-200 p-3 md:grid-cols-[1fr_1.5fr_auto]">
              <FormField label={`Fila ${index + 1} · Nombre`} htmlFor={`categoria-nombre-${index}`}>
                <Input id={`categoria-nombre-${index}`} maxLength={100} value={fila.nombre} onChange={(event) => actualizarFila(index, { nombre: event.target.value })} />
              </FormField>
              <FormField label="Descripción" htmlFor={`categoria-descripcion-${index}`}>
                <Input id={`categoria-descripcion-${index}`} maxLength={200} value={fila.descripcion ?? ''} onChange={(event) => actualizarFila(index, { descripcion: event.target.value })} />
              </FormField>
              <div className="flex items-end">
                <Button type="button" variant="ghost" aria-label={`Eliminar fila ${index + 1}`} onClick={() => quitarFila(index)}><LuTrash2 aria-hidden="true" size={16} /> Quitar</Button>
              </div>
              {errores.filter((item) => item.fila === index + 1).map((item, errorIndex) => (
                <p key={errorIndex} role="alert" className="text-sm text-red-700 md:col-span-3">
                  Fila {item.fila}{item.campo ? ` · ${item.campo}` : ''}: {item.mensaje}
                </p>
              ))}
              {filas.length === 0 && (
                <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
                  No hay filas. Agregá una categoría para comenzar.
                </p>
              )}
            </div>
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
          <ol className="list-inside list-decimal space-y-2 text-sm">
            {filas.map((fila, index) => <li key={index}><strong>{fila.nombre.trim() || 'Sin nombre'}</strong>{fila.descripcion?.trim() ? ` — ${fila.descripcion.trim()}` : ''}</li>)}
          </ol>
        </Card>
      )}
      {resultado && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{resultado}</p>}
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
