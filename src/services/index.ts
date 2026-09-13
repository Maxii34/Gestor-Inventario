// Capa de services: cada dominio expone aquí sus funciones usando el HTTP
// client de `@/lib/api`. Los services específicos se agregan en sus etapas.
export * from './auth.service';
export * from './dashboard.service';
export * from './productos.service';
export * from './categorias.service';
export * from './movimientos.service';
export * from './clientes.service';
export * from './usuarios.service';
export * from './ventas.service';
export * from './estadisticas.service';
