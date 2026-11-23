export function mismoContenido(actual: unknown, nuevo: unknown): boolean {
  return JSON.stringify(actual) === JSON.stringify(nuevo);
}
