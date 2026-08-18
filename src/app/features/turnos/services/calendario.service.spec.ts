import { describe, it, expect } from 'vitest';
import {
  agruparPorDia,
  lunesDe,
  rangoPeriodo,
  inicioDelDia,
} from './calendario.service';
import type { Turno } from '../../../core/models/turno.model';
import { SERVICIOS_SEMILLA } from '../../../core/models/servicio.model';

function dia(hora: number): Date {
  const f = new Date(2026, 7, 24); // lunes 24/08/2026
  f.setHours(hora, 0, 0, 0);
  return f;
}

function crearTurno(id: string, fecha: Date, profesional = 'Sofía'): Turno {
  const servicio = SERVICIOS_SEMILLA[0]!;
  return {
    id,
    cliente: { nombre: `Cliente ${id}`, telefono: '' },
    servicio,
    profesional,
    inicio: fecha,
    fin: new Date(fecha.getTime() + 60 * 60 * 1000),
    estado: 'Confirmado',
    recordatorioEnviado: false,
  };
}

describe('lunesDe', () => {
  it('devuelve el lunes de la semana para una fecha cualquiera', () => {
    const miercoles = new Date(2026, 7, 26); // mié 26/08
    const lunes = lunesDe(miercoles);
    expect(lunes.getDay()).toBe(1);
    expect(lunes.getDate()).toBe(24);
  });

  it('devuelve la misma fecha si ya es lunes', () => {
    const lunes = lunesDe(new Date(2026, 7, 24));
    expect(lunes.getDate()).toBe(24);
  });
});

describe('rangoPeriodo', () => {
  it('semana: lunes a domingo (7 días)', () => {
    const { from, to } = rangoPeriodo('semana', new Date(2026, 7, 26));
    expect(from.getDay()).toBe(1);
    expect(from.getDate()).toBe(24);
    expect(to.getDate()).toBe(30);
    const dias = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    expect(dias).toBe(7);
  });

  it('mes: primer y último día del mes', () => {
    const { from, to } = rangoPeriodo('mes', new Date(2026, 7, 15));
    expect(from.getDate()).toBe(1);
    expect(to.getMonth()).toBe(7);
    expect(to.getDate()).toBe(31);
  });
});

describe('agruparPorDia', () => {
  it('agrupa turnos por día y los ordena por hora', () => {
    const turnos = [
      crearTurno('t3', dia(16)),
      crearTurno('t1', dia(9)),
      crearTurno('t2', dia(11)),
    ];
    const grupos = agruparPorDia(turnos, 'todos');
    expect(grupos.size).toBe(1);
    const delDia = grupos.get('2026-08-24')!;
    expect(delDia.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
  });

  it('separa turnos de días distintos', () => {
    const t1 = crearTurno('t1', dia(9));
    const t2 = crearTurno('t2', new Date(2026, 7, 25, 10, 0, 0));
    const grupos = agruparPorDia([t1, t2], 'todos');
    expect(grupos.size).toBe(2);
  });

  it('respeta el filtro de profesional', () => {
    const t1 = crearTurno('t1', dia(9), 'Sofía');
    const t2 = crearTurno('t2', dia(10), 'Camila');
    const grupos = agruparPorDia([t1, t2], 'Camila');
    const delDia = grupos.get('2026-08-24')!;
    expect(delDia.map((t) => t.id)).toEqual(['t2']);
  });

  it('inicioDelDia deja la hora en 00:00', () => {
    const f = inicioDelDia(new Date(2026, 7, 24, 14, 30, 0));
    expect(f.getHours()).toBe(0);
    expect(f.getMinutes()).toBe(0);
  });
});
