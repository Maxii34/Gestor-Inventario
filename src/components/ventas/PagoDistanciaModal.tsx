'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  LuCircleCheck,
  LuCopy,
  LuCheck,
  LuClock,
  LuMessageCircle,
  LuTriangleAlert,
  LuX,
} from 'react-icons/lu';
import { Badge, Button, Modal } from '@/components/ui';
import { ApiError } from '@/lib/api/client';
import {
  obtenerVenta,
  type EstadoVentaBackend,
} from '@/services/ventas.service';

const POLLING_MS = 5000;

const ESTADO_VISUAL: Record<EstadoVentaBackend, { etiqueta: string; tono: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  PENDIENTE: { etiqueta: 'Pendiente de pago', tono: 'warning' },
  COMPLETADA: { etiqueta: 'Pagado', tono: 'success' },
  ANULADA: { etiqueta: 'Anulada', tono: 'neutral' },
  RECHAZADA: { etiqueta: 'Rechazado', tono: 'danger' },
};

interface PagoDistanciaModalProps {
  open: boolean;
  ventaId: number | null;
  initPoint: string | null;
  onClose: () => void;
}

export function PagoDistanciaModal({ open, ventaId, initPoint, onClose }: PagoDistanciaModalProps) {
  const [estado, setEstado] = useState<EstadoVentaBackend>('PENDIENTE');
  const [pollError, setPollError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const copiadoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detenerPolling = useCallback((): void => {
    if (intervaloRef.current !== null) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  const consultarEstado = useCallback(
    async (id: number): Promise<void> => {
      try {
        const venta = await obtenerVenta(id);
        setEstado(venta.estado);
        if (venta.estado === 'COMPLETADA' || venta.estado === 'RECHAZADA') {
          detenerPolling();
        }
      } catch (err) {
        setPollError(
          err instanceof ApiError
            ? err.message
            : 'No pudimos actualizar el estado del pago.',
        );
      }
    },
    [detenerPolling],
  );

  useEffect(() => {
    if (!open || ventaId === null) return;
    setEstado('PENDIENTE');
    setPollError(null);
    setCopiado(false);
    void consultarEstado(ventaId);
    intervaloRef.current = setInterval(() => {
      void consultarEstado(ventaId);
    }, POLLING_MS);
    return () => {
      detenerPolling();
    };
  }, [open, ventaId, consultarEstado, detenerPolling]);

  useEffect(() => {
    return () => {
      detenerPolling();
      if (copiadoTimeoutRef.current !== null) {
        clearTimeout(copiadoTimeoutRef.current);
      }
    };
  }, [detenerPolling]);

  async function copiarLink(): Promise<void> {
    if (!initPoint) return;
    try {
      await navigator.clipboard.writeText(initPoint);
      setCopiado(true);
      if (copiadoTimeoutRef.current !== null) {
        clearTimeout(copiadoTimeoutRef.current);
      }
      copiadoTimeoutRef.current = setTimeout(() => setCopiado(false), 2000);
    } catch {
      setPollError('No pudimos copiar el link. Copialo manualmente.');
    }
  }

  if (!open || ventaId === null || !initPoint) return null;

  const visual = ESTADO_VISUAL[estado];
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`Tu link de pago: ${initPoint}`)}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Pedido a distancia · Venta #${ventaId}`}
      description="Compartí el link con el cliente. El estado se actualiza solo."
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          <LuX aria-hidden="true" size={16} />
          Cerrar
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <LuClock aria-hidden="true" size={16} className="shrink-0 text-zinc-400" />
            Estado del pago
          </span>
          <Badge tone={visual.tono}>{visual.etiqueta}</Badge>
        </div>

        {estado === 'COMPLETADA' && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-semibold text-green-900"
          >
            <LuCircleCheck aria-hidden="true" size={18} className="shrink-0 text-green-600" />
            ¡Pago recibido! La venta #{ventaId} fue pagada correctamente.
          </p>
        )}

        {estado === 'RECHAZADA' && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-800"
          >
            <LuTriangleAlert aria-hidden="true" size={18} className="shrink-0 text-red-600" />
            El pago fue rechazado. Generá un nuevo link si el cliente quiere reintentar.
          </p>
        )}

        <div>
          <p className="mb-1.5 text-sm font-medium text-zinc-700">Link de pago</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <p className="min-w-0 flex-1 truncate rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600" title={initPoint}>
              {initPoint}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void copiarLink()}
              className="shrink-0"
            >
              {copiado ? (
                <>
                  <LuCheck aria-hidden="true" size={16} />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <LuCopy aria-hidden="true" size={16} />
                  Copiar link
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 p-4">
          <QRCodeSVG value={initPoint} size={180} aria-label={`Código QR del link de pago de la venta #${ventaId}`} />
          <p className="text-xs text-zinc-500">El cliente escanea el código para pagar</p>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <LuMessageCircle aria-hidden="true" size={16} />
          Compartir por WhatsApp
        </a>

        {pollError && (
          <p role="alert" className="text-xs text-red-600">
            {pollError}
          </p>
        )}
      </div>
    </Modal>
  );
}
