import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Turno, EstadoTurno } from '../../../core/models/turno.model';
import { API_URL } from '../../../core/api/environment';
import type { Agenda } from '../../../core/api/backend.models';
import {
  agendaAppointmentToTurno,
  ESTADO_UI_TO_BACKEND,
  formatearFechaISO,
} from '../../../core/api/mappers';
import { mensajeDeError } from '../../../core/api/error-utils';
import { ServiciosService } from '../../servicios-catalogo/services/servicios.service';

function inicioDelDia(fecha: Date): Date {
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return f;
}

@Injectable({ providedIn: 'root' })
export class TurnosStateService {
  private readonly http = inject(HttpClient);
  private readonly serviciosService = inject(ServiciosService);

  private readonly _turnos = signal<Turno[]>([]);
  private readonly _filtroProfesional = signal<string>('todos');
  private readonly _fechaActual = signal<Date>(inicioDelDia(new Date()));
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly turnos = this._turnos.asReadonly();
  readonly filtroProfesional = this._filtroProfesional.asReadonly();
  readonly fechaActual = this._fechaActual.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  readonly turnosInminentes = computed(() => {
    const ahora = new Date();
    const en60Min = new Date(ahora.getTime() + 60 * 60 * 1000);
    return this._turnos().filter(
      (t) =>
        t.estado === 'En Proceso' ||
        (t.estado === 'Confirmado' && t.inicio >= ahora && t.inicio <= en60Min) ||
        (t.estado === 'Pendiente' && t.inicio >= ahora && t.inicio <= en60Min),
    );
  });

  readonly turnosFiltrados = computed(() => {
    const filtro = this._filtroProfesional();
    if (filtro === 'todos') return this._turnos();
    return this._turnos().filter((t) => t.profesional === filtro);
  });

  readonly metricas = computed(() => {
    const todos = this._turnos();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const turnosHoy = todos.filter((t) => {
      const inicio = new Date(t.inicio);
      inicio.setHours(0, 0, 0, 0);
      return inicio.getTime() === hoy.getTime();
    });

    const facturacion = turnosHoy
      .filter((t) => t.estado === 'Finalizado' || t.estado === 'En Proceso' || t.estado === 'Confirmado')
      .reduce((sum, t) => sum + t.servicio.precioBase, 0);

    const conteoServicios = new Map<string, number>();
    for (const t of turnosHoy) {
      const key = `${t.servicio.categoria} - ${t.servicio.subtipo}`;
      conteoServicios.set(key, (conteoServicios.get(key) ?? 0) + 1);
    }
    let servicioMasDemandado = 'Sin datos';
    let maxCount = 0;
    for (const [servicio, count] of conteoServicios) {
      if (count > maxCount) {
        maxCount = count;
        servicioMasDemandado = servicio;
      }
    }

    const finalizados = turnosHoy.filter((t) => t.estado === 'Finalizado').length;
    const total = turnosHoy.length;
    const asistencia = total > 0 ? Math.round((finalizados / total) * 1000) / 10 : 0;

    const confirmados = turnosHoy.filter((t) => t.recordatorioEnviado).length;

    return { facturacion, servicioMasDemandado, asistencia, confirmados, totalTurnos: total };
  });

  async cargarAgenda(): Promise<void> {
    this._cargando.set(true);
    this._error.set(null);
    try {
      await this.serviciosService.cargarServiciosSiNecesario();
      const fecha = this._fechaActual();
      const agenda = await firstValueFrom(
        this.http.get<Agenda>(`${API_URL}/admin/agenda`, {
          params: { date: formatearFechaISO(fecha) },
        }),
      );
      const catalogo = this.serviciosService.catalogoPorSubtipo();
      this._turnos.set(
        agenda.appointments.map((app) => agendaAppointmentToTurno(app, fecha, catalogo)),
      );
    } catch (err) {
      this._error.set(mensajeDeError(err));
      this._turnos.set([]);
    } finally {
      this._cargando.set(false);
    }
  }

  irAlDiaAnterior(): void {
    this._fechaActual.update((fecha) => {
      const prev = new Date(fecha);
      prev.setDate(prev.getDate() - 1);
      return prev;
    });
    void this.cargarAgenda();
  }

  irAlDiaSiguiente(): void {
    this._fechaActual.update((fecha) => {
      const next = new Date(fecha);
      next.setDate(next.getDate() + 1);
      return next;
    });
    void this.cargarAgenda();
  }

  setFiltroProfesional(nombre: string): void {
    this._filtroProfesional.set(nombre);
  }

  agregarTurno(turno: Turno): void {
    this._turnos.update((lista) => [...lista, turno]);
  }

  cambiarEstado(turnoId: string, nuevoEstado: EstadoTurno): void {
    const turno = this._turnos().find((t) => t.id === turnoId);
    if (!turno || turno.estado === nuevoEstado) return;

    this._turnos.update((lista) =>
      lista.map((t) => (t.id === turnoId ? { ...t, estado: nuevoEstado } : t)),
    );

    if (nuevoEstado === 'En Proceso') return;

    this.http
      .patch(`${API_URL}/admin/appointments/${turnoId}/status`, {
        status: ESTADO_UI_TO_BACKEND[nuevoEstado],
      })
      .subscribe({
        error: () => {
          this._turnos.update((lista) =>
            lista.map((t) => (t.id === turnoId ? { ...t, estado: turno.estado } : t)),
          );
        },
      });
  }

  marcarRecordatorio(turnoId: string): void {
    this._turnos.update((lista) =>
      lista.map((t) => (t.id === turnoId ? { ...t, recordatorioEnviado: true } : t)),
    );
  }
}
