export type EstadoSuscripcion = 'VIGENTE' | 'SIN_VENCIMIENTO' | 'EN_GRACIA' | 'VENCIDA';

export type PlanSuscripcion = 'PRUEBA' | 'MENSUAL' | 'TRIMESTRAL';

export interface SuscripcionEstado {
  plan: PlanSuscripcion;
  estado: EstadoSuscripcion;
  accesoHasta: string | null;
  diasRestantes: number | null;
  enGracia: boolean;
  soloLectura: boolean;
  diasGracia: number;
}
