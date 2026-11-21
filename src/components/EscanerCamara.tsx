"use client";

import { useEffect, useRef, useState } from "react";

// Escáner de códigos de barras con la cámara. Usa el detector nativo del navegador
// (BarcodeDetector, disponible en Chrome para Android) y, si no existe, la librería
// "barcode-detector" (npm i barcode-detector) como alternativa, que sirve en iPhone.
//
// El componente solo LEE códigos: qué hacer con cada uno lo decide quien lo usa
// (agregar el producto a la venta, completar el campo del formulario, etc.).

const FORMATOS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"] as const;
// Misma regla que el backend: de 1 a 64 caracteres imprimibles, sin espacios.
const CODIGO_VALIDO = /^[\x21-\x7E]{1,64}$/;
const INTERVALO_MS = 200; // cuántas veces por segundo se intenta leer
const ESPERA_REPETIDO_MS = 2000; // ignora el mismo código si se vuelve a ver antes de esto

type Resultado = void | string;

interface Props {
  /**
   * Recibe cada código leído. Si devuelve un texto, se muestra en pantalla como aviso
   * (por ejemplo "Agregado: Coca Cola 1L" o "Código no registrado").
   */
  onCodigo: (codigo: string) => Resultado | Promise<Resultado>;
  onCerrar: () => void;
  /**
   * true: sigue leyendo después de cada código (pantalla de venta).
   * false: se cierra al leer el primero (formulario de producto).
   */
  continuo?: boolean;
}

interface Detector {
  detect: (fuente: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
}

// Devuelve un mensaje si el dispositivo no puede usar la cámara, o null si puede.
const soporteCamara = (): string | null => {
  if (typeof window === "undefined") return null;
  if (!window.isSecureContext) {
    return "La cámara solo funciona en una conexión segura (HTTPS). Escribí el código a mano.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Este navegador no permite usar la cámara. Escribí el código a mano.";
  }
  return null;
};

const mensajeDeError = (e: unknown): string => {
  const nombre = (e as { name?: string } | null)?.name;
  switch (nombre) {
    case "NotAllowedError":
      return "No diste permiso para usar la cámara. Habilitalo en los ajustes del navegador y probá de nuevo.";
    case "NotFoundError":
      return "No encontramos una cámara en este dispositivo.";
    case "NotReadableError":
      return "La cámara está siendo usada por otra aplicación. Cerrala y probá de nuevo.";
    default:
      return "No se pudo iniciar la cámara. Escribí el código a mano.";
  }
};

const crearDetector = async (): Promise<Detector> => {
  const Nativo = (
    globalThis as { BarcodeDetector?: new (opciones: { formats: string[] }) => Detector }
  ).BarcodeDetector;

  if (Nativo) {
    try {
      return new Nativo({ formats: [...FORMATOS] });
    } catch {
      // Algún formato no está soportado: se usa la librería.
    }
  }

  // Se importa solo si hace falta, para no cargar código de más en los celulares
  // que ya traen el detector nativo.
  const { BarcodeDetector } = await import("barcode-detector/ponyfill");
  return new BarcodeDetector({ formats: [...FORMATOS] }) as unknown as Detector;
};

const estilos = {
  fondo: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "#000",
    display: "flex",
    flexDirection: "column",
  },
  barra: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
  },
  cerrar: {
    minHeight: 44,
    minWidth: 44,
    padding: "0 16px",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: 10,
    background: "transparent",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
  },
  visor: { position: "relative", flex: 1, overflow: "hidden" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  marco: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "78%",
    maxWidth: 420,
    aspectRatio: "3 / 2",
    transform: "translate(-50%, -50%)",
    border: "3px solid #fff",
    borderRadius: 16,
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
    pointerEvents: "none",
  },
  pie: {
    minHeight: 72,
    padding: "16px",
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
} as const;

export default function EscanerCamara({ onCodigo, onCerrar, continuo = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ultimo = useRef({ codigo: "", hora: 0 });
  // Guarda siempre las últimas funciones recibidas, sin reiniciar la cámara cada vez.
  const propsRef = useRef({ onCodigo, onCerrar, continuo });

  const [error, setError] = useState<string | null>(() => soporteCamara());
  const [listo, setListo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    propsRef.current = { onCodigo, onCerrar, continuo };
  });

  // Escape cierra el escáner.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") propsRef.current.onCerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  useEffect(() => {
    if (soporteCamara()) return;

    let cancelado = false;
    let flujo: MediaStream | null = null;
    let temporizador: ReturnType<typeof setInterval> | null = null;
    let leyendo = false;

    const manejar = async (codigo: string) => {
      const ahora = Date.now();
      if (codigo === ultimo.current.codigo && ahora - ultimo.current.hora < ESPERA_REPETIDO_MS) {
        return;
      }
      ultimo.current = { codigo, hora: ahora };
      navigator.vibrate?.(80);

      const mensaje = await propsRef.current.onCodigo(codigo);
      if (cancelado) return;
      if (typeof mensaje === "string") setAviso(mensaje);
      if (!propsRef.current.continuo) propsRef.current.onCerrar();
    };

    const iniciar = async () => {
      try {
        const detector = await crearDetector();
        if (cancelado) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" }, // cámara trasera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelado) {
          stream.getTracks().forEach((pista) => pista.stop());
          return;
        }
        flujo = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (cancelado) return;
        setListo(true);

        temporizador = setInterval(async () => {
          if (leyendo || video.readyState < 2) return;
          leyendo = true;
          try {
            const resultados = await detector.detect(video);
            const codigo = resultados[0]?.rawValue?.trim();
            if (codigo && CODIGO_VALIDO.test(codigo)) await manejar(codigo);
          } catch {
            // Un cuadro que no se pudo leer es normal: se prueba con el siguiente.
          } finally {
            leyendo = false;
          }
        }, INTERVALO_MS);
      } catch (e) {
        if (!cancelado) setError(mensajeDeError(e));
      }
    };

    iniciar();

    // Al cerrar hay que soltar la cámara, si no queda encendida.
    return () => {
      cancelado = true;
      if (temporizador) clearInterval(temporizador);
      flujo?.getTracks().forEach((pista) => pista.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label="Escanear código de barras" style={estilos.fondo}>
      <div style={estilos.barra}>
        <span>Escaneá el código de barras</span>
        <button type="button" onClick={onCerrar} style={estilos.cerrar} autoFocus>
          Cerrar
        </button>
      </div>

      <div style={estilos.visor}>
        <video ref={videoRef} playsInline muted autoPlay style={estilos.video} />
        {listo && !error && <div style={estilos.marco} aria-hidden="true" />}
      </div>

      <div style={estilos.pie} aria-live="polite">
        {error ?? aviso ?? (listo ? "Apuntá al código, a unos 15 cm y con buena luz." : "Iniciando cámara…")}
      </div>
    </div>
  );
}