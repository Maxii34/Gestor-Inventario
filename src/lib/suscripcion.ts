export const MENSAJE_SOLO_LECTURA =
  'Tu suscripción venció: el sistema está en modo solo lectura. Contactá a soporte para renovarla.';

export const MENSAJE_CUENTA_SUSPENDIDA =
  'La cuenta está suspendida. Contactá a soporte.';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function esMensajeSoloLectura(mensaje: string): boolean {
  const texto = normalizar(mensaje);
  return (
    (texto.includes('suscripcion') && texto.includes('venci')) ||
    texto.includes('modo solo lectura')
  );
}

export function esMensajeCuentaSuspendida(mensaje: string): boolean {
  const texto = normalizar(mensaje);
  return texto.includes('suspendid');
}
