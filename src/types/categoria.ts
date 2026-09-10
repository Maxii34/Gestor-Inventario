export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  cantidadProductos: number;
  estado: 'activa' | 'inactiva';
}
