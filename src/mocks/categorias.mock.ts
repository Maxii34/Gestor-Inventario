import { Categoria } from '@/types';

export const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: 'cat-1',
    nombre: 'Periféricos',
    descripcion: 'Teclados, mouses y accesorios de entrada/salida',
    cantidadProductos: 12,
    estado: 'activa',
  },
  {
    id: 'cat-2',
    nombre: 'Monitores',
    descripcion: 'Pantallas y displays para PC',
    cantidadProductos: 5,
    estado: 'activa',
  },
  {
    id: 'cat-3',
    nombre: 'Componentes',
    descripcion: 'Procesadores, memorias RAM, tarjetas de video',
    cantidadProductos: 24,
    estado: 'activa',
  },
];
