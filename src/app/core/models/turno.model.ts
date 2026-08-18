import type { Servicio } from './servicio.model';

export type EstadoTurno =
  | 'Confirmado'
  | 'Pendiente'
  | 'En Proceso'
  | 'Finalizado'
  | 'Cancelado'
  | 'Reprogramado'
  | 'No Asiste';

export interface Turno {
  id: string;
  cliente: { nombre: string; telefono: string };
  servicio: Servicio;
  profesional: string;
  inicio: Date;
  fin: Date;
  estado: EstadoTurno;
  recordatorioEnviado: boolean;
}
