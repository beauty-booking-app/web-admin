import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { Turno } from '../../../core/models/turno.model';
import { API_URL } from '../../../core/api/environment';
import type { Appointment } from '../../../core/api/backend.models';
import { appointmentToTurno, formatearFechaISO } from '../../../core/api/mappers';
import { mensajeDeError } from '../../../core/api/error-utils';
import { TurnosStateService } from './turnos-state.service';
import { ServiciosService } from '../../servicios-catalogo/services/servicios.service';

export type VistaCalendario = 'semana' | 'mes';

export function inicioDelDia(fecha: Date): Date {
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return f;
}

export function lunesDe(fecha: Date): Date {
  const f = inicioDelDia(fecha);
  const offset = (f.getDay() + 6) % 7;
  f.setDate(f.getDate() - offset);
  return f;
}

export function rangoPeriodo(
  vista: VistaCalendario,
  fechaAncla: Date,
): { from: Date; to: Date } {
  if (vista === 'semana') {
    const lunes = lunesDe(fechaAncla);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { from: lunes, to: domingo };
  }
  const ancla = inicioDelDia(fechaAncla);
  return {
    from: new Date(ancla.getFullYear(), ancla.getMonth(), 1),
    to: new Date(ancla.getFullYear(), ancla.getMonth() + 1, 0),
  };
}

export function agruparPorDia(turnos: Turno[], filtro: string): Map<string, Turno[]> {
  const mapa = new Map<string, Turno[]>();
  for (const t of turnos) {
    if (filtro !== 'todos' && t.profesional !== filtro) continue;
    const key = formatearFechaISO(t.inicio);
    const lista = mapa.get(key) ?? [];
    lista.push(t);
    mapa.set(key, lista);
  }
  for (const lista of mapa.values()) {
    lista.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }
  return mapa;
}

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly turnosState = inject(TurnosStateService);
  private readonly serviciosService = inject(ServiciosService);

  private readonly _vista = signal<VistaCalendario>('semana');
  private readonly _fechaAncla = signal<Date>(inicioDelDia(new Date()));
  private readonly _turnos = signal<Turno[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly vista = this._vista.asReadonly();
  readonly fechaAncla = this._fechaAncla.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  readonly turnosPorDia = computed(() =>
    agruparPorDia(this._turnos(), this.turnosState.filtroProfesional()),
  );

  readonly labelPeriodo = computed(() => {
    const vista = this._vista();
    const fecha = this._fechaAncla();
    if (vista === 'semana') {
      const lunes = lunesDe(fecha);
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      const rango = (f: Date) =>
        f.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
      return `Semana del ${rango(lunes)} al ${rango(domingo)}`;
    }
    const texto = fecha.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });

  async cargarPeriodo(): Promise<void> {
    this._cargando.set(true);
    this._error.set(null);
    try {
      await this.serviciosService.cargarServiciosSiNecesario();
      const { from, to } = rangoPeriodo(this._vista(), this._fechaAncla());
      const appointments = await firstValueFrom(
        this.http.get<Appointment[]>(`${API_URL}/admin/appointments`, {
          params: { from: formatearFechaISO(from), to: formatearFechaISO(to) },
        }),
      );
      const catalogo = this.serviciosService.catalogoPorSubtipo();
      this._turnos.set(appointments.map((a) => appointmentToTurno(a, catalogo)));
    } catch (err) {
      this._error.set(mensajeDeError(err));
      this._turnos.set([]);
    } finally {
      this._cargando.set(false);
    }
  }

  irAnterior(): void {
    this._fechaAncla.update((fecha) => this.moverPeriodo(fecha, -1));
    void this.cargarPeriodo();
  }

  irSiguiente(): void {
    this._fechaAncla.update((fecha) => this.moverPeriodo(fecha, 1));
    void this.cargarPeriodo();
  }

  irHoy(): void {
    this._fechaAncla.set(inicioDelDia(new Date()));
    void this.cargarPeriodo();
  }

  cambiarVista(vista: VistaCalendario): void {
    this._vista.set(vista);
    void this.cargarPeriodo();
  }

  turnosDelDia(fecha: Date): Turno[] {
    return this.turnosPorDia().get(formatearFechaISO(fecha)) ?? [];
  }

  async irAlDia(fecha: Date): Promise<void> {
    this.turnosState.irAlDia(fecha);
    await this.router.navigate(['/']);
  }

  private moverPeriodo(fecha: Date, delta: number): Date {
    const f = inicioDelDia(fecha);
    if (this._vista() === 'semana') {
      f.setDate(f.getDate() + delta * 7);
    } else {
      f.setMonth(f.getMonth() + delta);
    }
    return f;
  }
}
