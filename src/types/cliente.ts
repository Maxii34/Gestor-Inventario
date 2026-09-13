export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  direccion: string;
  fechaRegistro: string;
  estado: 'activo' | 'inactivo';
}
