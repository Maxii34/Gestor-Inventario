export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  categoriaNombre: string;
  precio: number;
  costo: number;
  stockActual: number;
  stockMinimo: number;
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
}
