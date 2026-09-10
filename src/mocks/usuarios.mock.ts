import { Usuario } from '@/types';

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: 'usr-1',
    nombre: 'Carlos Pérez',
    email: 'carlos.perez@empresa.com',
    rol: 'admin',
    estado: 'activo',
    ultimoAcceso: '2026-03-02 09:00',
  },
  {
    id: 'usr-2',
    nombre: 'Ana Gómez',
    email: 'ana.gomez@empresa.com',
    rol: 'vendedor',
    estado: 'activo',
    ultimoAcceso: '2026-03-02 14:00',
  },
  {
    id: 'usr-3',
    nombre: 'Luis Fernández',
    email: 'luis.fernandez@empresa.com',
    rol: 'almacen',
    estado: 'inactivo',
    ultimoAcceso: '2026-02-20 16:30',
  },
];
