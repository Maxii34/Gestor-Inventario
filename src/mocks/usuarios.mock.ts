import { Usuario } from '@/types';

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: 'usr-1',
    nombre: 'Carlos Rodríguez',
    email: 'carlos@gestor.com',
    rol: 'admin',
    estado: 'activo',
    ultimoAcceso: '2026-09-09 09:00',
  },
  {
    id: 'usr-2',
    nombre: 'María González',
    email: 'maria@gestor.com',
    rol: 'vendedor',
    estado: 'activo',
    ultimoAcceso: '2026-09-09 08:30',
  },
  {
    id: 'usr-3',
    nombre: 'Lucas Fernández',
    email: 'lucas@gestor.com',
    rol: 'vendedor',
    estado: 'activo',
    ultimoAcceso: '2026-09-08 17:45',
  },
  {
    id: 'usr-4',
    nombre: 'Ana Martínez',
    email: 'ana@gestor.com',
    rol: 'admin',
    estado: 'activo',
    ultimoAcceso: '2026-09-08 10:15',
  },
  {
    id: 'usr-5',
    nombre: 'Diego Torres',
    email: 'diego@gestor.com',
    rol: 'vendedor',
    estado: 'activo',
    ultimoAcceso: '2026-09-07 13:20',
  },
  {
    id: 'usr-6',
    nombre: 'Laura Sosa',
    email: 'laura@gestor.com',
    rol: 'vendedor',
    estado: 'inactivo',
    ultimoAcceso: '2026-08-28 16:05',
  },
];

export interface ResumenUsuarios {
  total: number;
  administradores: number;
  vendedores: number;
}

// Resumen global fijo. Dato mock: no se calcula en tiempo de ejecución.
export const MOCK_USUARIOS_RESUMEN: ResumenUsuarios = {
  total: 6,
  administradores: 2,
  vendedores: 4,
};
