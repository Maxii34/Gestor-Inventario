import { Categoria } from '@/types';

export const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: 'cat-1',
    nombre: 'Electrónica',
    descripcion: 'Notebooks, monitores y equipos electrónicos',
    cantidadProductos: 34,
    estado: 'activa',
  },
  {
    id: 'cat-2',
    nombre: 'Hogar',
    descripcion: 'Artículos y electrodomésticos para el hogar',
    cantidadProductos: 21,
    estado: 'activa',
  },
  {
    id: 'cat-3',
    nombre: 'Oficina',
    descripcion: 'Insumos y equipamiento para oficinas',
    cantidadProductos: 18,
    estado: 'activa',
  },
  {
    id: 'cat-4',
    nombre: 'Accesorios',
    descripcion: 'Accesorios y complementos varios',
    cantidadProductos: 45,
    estado: 'activa',
  },
  {
    id: 'cat-5',
    nombre: 'Informática',
    descripcion: 'Componentes y periféricos de computación',
    cantidadProductos: 27,
    estado: 'activa',
  },
  {
    id: 'cat-6',
    nombre: 'Telefonía',
    descripcion: 'Celulares, fundas y accesorios móviles',
    cantidadProductos: 9,
    estado: 'inactiva',
  },
  {
    id: 'cat-7',
    nombre: 'Audio',
    descripcion: 'Auriculares, parlantes y equipos de sonido',
    cantidadProductos: 16,
    estado: 'activa',
  },
  {
    id: 'cat-8',
    nombre: 'Almacenamiento',
    descripcion: 'Discos, memorias y unidades de almacenamiento',
    cantidadProductos: 12,
    estado: 'activa',
  },
  {
    id: 'cat-9',
    nombre: 'Periféricos',
    descripcion: 'Teclados, mouses y accesorios de entrada/salida',
    cantidadProductos: 23,
    estado: 'activa',
  },
  {
    id: 'cat-10',
    nombre: 'Monitores',
    descripcion: 'Pantallas y displays para PC',
    cantidadProductos: 7,
    estado: 'inactiva',
  },
];

export interface ResumenCategorias {
  total: number;
  activas: number;
  inactivas: number;
}

// Resumen global fijo. Dato mock: no se calcula en tiempo de ejecución.
export const MOCK_CATEGORIAS_RESUMEN: ResumenCategorias = {
  total: 12,
  activas: 10,
  inactivas: 2,
};
