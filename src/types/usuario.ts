export type RolUsuario = 'admin' | 'vendedor' | 'almacen';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  estado: 'activo' | 'inactivo';
  ultimoAcceso: string;
}
