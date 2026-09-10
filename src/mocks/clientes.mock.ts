import { Cliente } from '@/types';

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    telefono: '381-555-1234',
    documento: '38.456.789',
    direccion: 'Av. Mate de Luna 1234, Tucumán',
    fechaRegistro: '2026-01-05',
    estado: 'activo',
  },
  {
    id: 'cli-2',
    nombre: 'María González',
    email: 'maria.gonzalez@email.com',
    telefono: '381-555-5678',
    documento: '32.187.654',
    direccion: 'Calle San Martín 456, Tucumán',
    fechaRegistro: '2026-01-18',
    estado: 'activo',
  },
  {
    id: 'cli-3',
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    telefono: '381-555-9012',
    documento: '29.874.321',
    direccion: 'Av. Sarmiento 789, Tucumán',
    fechaRegistro: '2026-02-02',
    estado: 'activo',
  },
  {
    id: 'cli-4',
    nombre: 'Lucía Fernández',
    email: 'lucia.fernandez@email.com',
    telefono: '381-555-3456',
    documento: '36.542.198',
    direccion: 'Calle Córdoba 234, Tucumán',
    fechaRegistro: '2026-02-20',
    estado: 'activo',
  },
  {
    id: 'cli-5',
    nombre: 'Pedro Sánchez',
    email: 'pedro.sanchez@email.com',
    telefono: '381-555-7890',
    documento: '41.203.876',
    direccion: 'Av. Belgrano 567, Tucumán',
    fechaRegistro: '2026-03-10',
    estado: 'inactivo',
  },
  {
    id: 'cli-6',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    telefono: '381-555-2345',
    documento: '34.765.432',
    direccion: 'Calle Mendoza 890, Tucumán',
    fechaRegistro: '2026-04-05',
    estado: 'activo',
  },
  {
    id: 'cli-7',
    nombre: 'Diego López',
    email: 'diego.lopez@email.com',
    telefono: '381-555-6789',
    documento: '39.654.123',
    direccion: 'Av. Roca 345, Tucumán',
    fechaRegistro: '2026-05-12',
    estado: 'activo',
  },
  {
    id: 'cli-8',
    nombre: 'Sofía Ramírez',
    email: 'sofia.ramirez@email.com',
    telefono: '381-555-0123',
    documento: '37.891.456',
    direccion: 'Calle Salta 678, Tucumán',
    fechaRegistro: '2026-06-08',
    estado: 'activo',
  },
];

export interface ResumenClientes {
  total: number;
  activos: number;
  inactivos: number;
}

// Resumen global fijo. Dato mock: no se calcula en tiempo de ejecución.
export const MOCK_CLIENTES_RESUMEN: ResumenClientes = {
  total: 86,
  activos: 78,
  inactivos: 8,
};
