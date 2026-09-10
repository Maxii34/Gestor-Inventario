import { Cliente } from '@/types';

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Empresa Alpha S.A.',
    email: 'contacto@alpha.com',
    telefono: '+54 11 4444-5555',
    documento: '30-12345678-9',
    direccion: 'Av. Corrientes 1234, CABA',
    fechaRegistro: '2026-01-05',
    estado: 'activo',
  },
  {
    id: 'cli-2',
    nombre: 'Juan Rodríguez',
    email: 'juan.rodriguez@email.com',
    telefono: '+54 11 9999-8888',
    documento: '35123456',
    direccion: 'Calle Falsa 123, Córdoba',
    fechaRegistro: '2026-02-10',
    estado: 'activo',
  },
];
