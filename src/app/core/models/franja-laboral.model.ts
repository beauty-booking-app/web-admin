export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export interface FranjaLaboral {
  dia: DiaSemana;
  activo: boolean;
  horaInicio: string;
  horaFin: string;
}

export const FRANJAS_SEMILLA: FranjaLaboral[] = [
  { dia: 'Lunes',    activo: true,  horaInicio: '09:00', horaFin: '20:00' },
  { dia: 'Martes',   activo: true,  horaInicio: '09:00', horaFin: '20:00' },
  { dia: 'Miércoles',activo: true,  horaInicio: '09:00', horaFin: '20:00' },
  { dia: 'Jueves',   activo: true,  horaInicio: '09:00', horaFin: '20:00' },
  { dia: 'Viernes',  activo: true,  horaInicio: '09:00', horaFin: '20:00' },
  { dia: 'Sábado',   activo: true,  horaInicio: '09:00', horaFin: '18:00' },
  { dia: 'Domingo',  activo: false, horaInicio: '09:00', horaFin: '18:00' },
];
