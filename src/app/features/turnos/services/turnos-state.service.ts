import { Injectable, signal, computed } from '@angular/core';
import type { Turno, EstadoTurno } from '../../../core/models/turno.model';
import { SERVICIOS_SEMILLA } from '../../../core/models/servicio.model';

@Injectable({ providedIn: 'root' })
export class TurnosStateService {
  private readonly _turnos = signal<Turno[]>(this.crearDatosSemilla());
  private readonly _filtroProfesional = signal<string>('todos');

  readonly turnos = this._turnos.asReadonly();
  readonly filtroProfesional = this._filtroProfesional.asReadonly();

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

  setFiltroProfesional(nombre: string): void {
    this._filtroProfesional.set(nombre);
  }

  agregarTurno(turno: Turno): void {
    this._turnos.update((lista) => [...lista, turno]);
  }

  cambiarEstado(turnoId: string, nuevoEstado: EstadoTurno): void {
    this._turnos.update((lista) =>
      lista.map((t) => (t.id === turnoId ? { ...t, estado: nuevoEstado } : t)),
    );
  }

  marcarRecordatorio(turnoId: string): void {
    this._turnos.update((lista) =>
      lista.map((t) => (t.id === turnoId ? { ...t, recordatorioEnviado: true } : t)),
    );
  }

  private crearDatosSemilla(): Turno[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const d = (horas: number, minutos: number): Date => {
      const fecha = new Date(hoy);
      fecha.setHours(horas, minutos, 0, 0);
      return fecha;
    };

    const fin = (inicio: Date, duracionMin: number): Date =>
      new Date(inicio.getTime() + duracionMin * 60 * 1000);

    const servicio = (id: string) => SERVICIOS_SEMILLA.find((s) => s.id === id)!;

    return [
      {
        id: 'turno-001',
        cliente: { nombre: 'Lucía Méndez', telefono: '+54 9 351 555-1001' },
        servicio: servicio('color-global'),
        profesional: 'Sofía',
        inicio: d(9, 0),
        fin: fin(d(9, 0), 75),
        estado: 'Confirmado',
        recordatorioEnviado: true,
      },
      {
        id: 'turno-002',
        cliente: { nombre: 'Andrea Paez', telefono: '+54 9 351 555-1002' },
        servicio: servicio('unas-semi'),
        profesional: 'Camila',
        inicio: d(9, 0),
        fin: fin(d(9, 0), 50),
        estado: 'Finalizado',
        recordatorioEnviado: true,
      },
      {
        id: 'turno-003',
        cliente: { nombre: 'Mariana Gómez', telefono: '+54 9 351 445-8890' },
        servicio: servicio('color-mechas'),
        profesional: 'Sofía',
        inicio: d(10, 0),
        fin: fin(d(10, 0), 90),
        estado: 'En Proceso',
        recordatorioEnviado: true,
      },
      {
        id: 'turno-004',
        cliente: { nombre: 'Sofía Rivas', telefono: '+54 9 351 555-1004' },
        servicio: servicio('unas-kapping'),
        profesional: 'Camila',
        inicio: d(10, 0),
        fin: fin(d(10, 0), 60),
        estado: 'Confirmado',
        recordatorioEnviado: true,
      },
      {
        id: 'turno-005',
        cliente: { nombre: 'Valeria Fernández', telefono: '+54 9 351 223-9911' },
        servicio: servicio('trat-botox'),
        profesional: 'Sofía',
        inicio: d(11, 30),
        fin: fin(d(11, 30), 60),
        estado: 'Pendiente',
        recordatorioEnviado: false,
      },
      {
        id: 'turno-006',
        cliente: { nombre: 'Carolina Rossi', telefono: '+54 9 351 988-1234' },
        servicio: servicio('unas-softgel'),
        profesional: 'Camila',
        inicio: d(11, 0),
        fin: fin(d(11, 0), 75),
        estado: 'Confirmado',
        recordatorioEnviado: true,
      },
      {
        id: 'turno-007',
        cliente: { nombre: 'Camila Herrera', telefono: '+54 9 351 555-1007' },
        servicio: servicio('corte-dama'),
        profesional: 'Sofía',
        inicio: d(12, 0),
        fin: fin(d(12, 0), 45),
        estado: 'Confirmado',
        recordatorioEnviado: true,
      },
    ];
  }
}
