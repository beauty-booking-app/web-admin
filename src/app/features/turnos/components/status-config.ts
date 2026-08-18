import type { EstadoTurno } from '../../../core/models/turno.model';

export interface EstadoConfig {
  label: string;
  bg: string;
  text: string;
}

export const STATUS_CONFIG: Record<EstadoTurno, EstadoConfig> = {
  'En Proceso': { label: 'En Proceso', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Confirmado': { label: 'Confirmado', bg: 'bg-purple-100', text: 'text-purple-700' },
  'Pendiente': { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
  'Finalizado': { label: 'Finalizado', bg: 'bg-slate-100', text: 'text-slate-500' },
  'Cancelado': { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-500' },
  'Reprogramado': { label: 'Reprogramado', bg: 'bg-blue-100', text: 'text-blue-700' },
  'No Asiste': { label: 'No Asiste', bg: 'bg-orange-100', text: 'text-orange-700' },
};

export const CATEGORY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  'CORTE UNISEX': { label: 'Corte', bg: 'bg-rose-50', text: 'text-rose-700' },
  'TRATAMIENTOS CAPILARES': { label: 'Tratamiento', bg: 'bg-pink-50', text: 'text-pink-700' },
  'COLOR': { label: 'Color', bg: 'bg-purple-50', text: 'text-purple-700' },
  'UÑAS': { label: 'Uñas', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};
