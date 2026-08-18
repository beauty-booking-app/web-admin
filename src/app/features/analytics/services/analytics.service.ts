import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Servicio, CategoriaServicio } from '../../../core/models/servicio.model';
import { API_URL } from '../../../core/api/environment';
import type { Appointment, AppointmentStatus } from '../../../core/api/backend.models';
import { mensajeDeError } from '../../../core/api/error-utils';
import { ServiciosService } from '../../servicios-catalogo/services/servicios.service';

interface MesAnalitico {
  key: string;
  label: string;
  cantidad: number;
  facturacion: number;
}

interface ServicioTop {
  subtipo: string;
  categoria: CategoriaServicio;
  cantidad: number;
  recaudacion: number;
}

interface ClienteFrecuente {
  nombre: string;
  cantidad: number;
}

interface TurnoHistorico {
  inicio: Date;
  estado: 'Confirmado' | 'Finalizado' | 'Cancelado' | 'Pendiente';
  servicio: Servicio;
  cliente: { nombre: string };
  profesional: string;
}

function estadoHistorico(estado: AppointmentStatus): TurnoHistorico['estado'] {
  switch (estado) {
    case 'completado':
      return 'Finalizado';
    case 'confirmado':
    case 'reprogramado':
      return 'Confirmado';
    case 'cancelado':
    case 'no_asiste':
      return 'Cancelado';
    case 'pendiente':
      return 'Pendiente';
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly serviciosService = inject(ServiciosService);

  private readonly _turnos = signal<TurnoHistorico[]>([]);
  private readonly _mesSeleccionado = signal<string>('');
  private readonly _categoriaSeleccionada = signal<CategoriaServicio | 'TODAS'>('TODAS');
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly categorias: CategoriaServicio[] = [
    'CORTE UNISEX',
    'TRATAMIENTOS CAPILARES',
    'COLOR',
    'UÑAS',
  ];

  readonly meses = computed(() => {
    const ahora = new Date();
    const lista: { key: string; label: string }[] = [];
    for (let i = 6; i >= 1; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      lista.push({ key: this.mesKey(fecha), label: this.mesLabel(fecha) });
    }
    return lista;
  });

  readonly mesSeleccionado = this._mesSeleccionado.asReadonly();
  readonly categoriaSeleccionada = this._categoriaSeleccionada.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this._mesSeleccionado.set(this.meses()[this.meses().length - 1].key);
  }

  async cargarHistorico(): Promise<void> {
    if (this._cargando()) return;
    this._cargando.set(true);
    this._error.set(null);
    try {
      await this.serviciosService.cargarServiciosSiNecesario();
      const catalogo = this.serviciosService.catalogoPorSubtipo();
      const turnos: TurnoHistorico[] = [];
      for (const mes of this.meses()) {
        const { from, to } = this.rangoDeMes(mes.key);
        const citas = await firstValueFrom(
          this.http.get<Appointment[]>(`${API_URL}/admin/appointments`, {
            params: { from, to },
          }),
        );
        for (const cita of citas) {
          turnos.push(...this.citaATurnos(cita, catalogo));
        }
      }
      this._turnos.set(turnos);
    } catch (err) {
      this._error.set(mensajeDeError(err));
      this._turnos.set([]);
    } finally {
      this._cargando.set(false);
    }
  }

  readonly turnosPorMes = computed<MesAnalitico[]>(() => {
    const porMes = new Map<string, { cantidad: number; facturacion: number }>();
    for (const mes of this.meses()) {
      porMes.set(mes.key, { cantidad: 0, facturacion: 0 });
    }
    for (const turno of this._turnos()) {
      const key = this.mesKey(turno.inicio);
      const registro = porMes.get(key);
      if (registro) {
        registro.cantidad += 1;
        if (turno.estado === 'Finalizado' || turno.estado === 'Confirmado') {
          registro.facturacion += turno.servicio.precioBase;
        }
      }
    }
    return this.meses().map((mes) => ({
      key: mes.key,
      label: mes.label,
      cantidad: porMes.get(mes.key)?.cantidad ?? 0,
      facturacion: porMes.get(mes.key)?.facturacion ?? 0,
    }));
  });

  readonly gananciasPorMes = computed(() => {
    const base = this.turnosPorMes();
    return base.map((mes, index) => {
      const anterior = index > 0 ? base[index - 1].facturacion : 0;
      const diferencia = anterior > 0 ? ((mes.facturacion - anterior) / anterior) * 100 : 0;
      return { ...mes, diferenciaPct: Math.round(diferencia * 10) / 10 };
    });
  });

  readonly kpis = computed(() => {
    const turnos = this.turnosDelMesSeleccionado();
    const clientes = new Set(turnos.map((t) => t.cliente.nombre));
    const facturacion = turnos
      .filter((t) => t.estado === 'Finalizado' || t.estado === 'Confirmado')
      .reduce((sum, t) => sum + t.servicio.precioBase, 0);
    const ticket = turnos.length > 0 ? facturacion / turnos.length : 0;
    return {
      totalTurnos: turnos.length,
      clientesUnicos: clientes.size,
      facturacion,
      ticketPromedio: Math.round(ticket),
    };
  });

  readonly serviciosTop = computed<ServicioTop[]>(() => {
    const turnos = this.filtradosPorCategoria();
    const conteo = new Map<string, { cantidad: number; recaudacion: number }>();
    for (const turno of turnos) {
      const key = turno.servicio.subtipo;
      const registro = conteo.get(key) ?? { cantidad: 0, recaudacion: 0 };
      registro.cantidad += 1;
      registro.recaudacion += turno.servicio.precioBase;
      conteo.set(key, registro);
    }
    return [...conteo.entries()]
      .map(([subtipo, datos]) => {
        const servicio = this._turnos().find((t) => t.servicio.subtipo === subtipo)?.servicio;
        return {
          subtipo,
          categoria: servicio?.categoria ?? 'CORTE UNISEX',
          cantidad: datos.cantidad,
          recaudacion: datos.recaudacion,
        };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  });

  readonly clientesFrecuentes = computed<ClienteFrecuente[]>(() => {
    const turnos = this.turnosDelMesSeleccionado();
    const conteo = new Map<string, number>();
    for (const turno of turnos) {
      conteo.set(turno.cliente.nombre, (conteo.get(turno.cliente.nombre) ?? 0) + 1);
    }
    return [...conteo.entries()]
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  });

  setMesSeleccionado(key: string): void {
    this._mesSeleccionado.set(key);
  }

  setCategoriaSeleccionada(categoria: CategoriaServicio | 'TODAS'): void {
    this._categoriaSeleccionada.set(categoria);
  }

  private mesKey(fecha: Date): string {
    return `${fecha.getFullYear()}-${fecha.getMonth()}`;
  }

  private mesLabel(fecha: Date): string {
    return fecha.toLocaleDateString('es-AR', { month: 'long', year: '2-digit' });
  }

  private rangoDeMes(key: string): { from: string; to: string } {
    const [anio, mesIdx] = key.split('-').map(Number);
    const ultimoDia = new Date(anio, mesIdx + 1, 0).getDate();
    const mes = String(mesIdx + 1).padStart(2, '0');
    const dia = String(ultimoDia).padStart(2, '0');
    return { from: `${anio}-${mes}-01`, to: `${anio}-${mes}-${dia}` };
  }

  private citaATurnos(
    cita: Appointment,
    catalogoPorSubtipo: ReadonlyMap<string, Servicio>,
  ): TurnoHistorico[] {
    const inicio = new Date(cita.startTime);
    return cita.serviceTypes.map((linea) => {
      const base = catalogoPorSubtipo.get(linea.name);
      const categoria = base?.categoria ?? 'CORTE UNISEX';
      const profesional = categoria === 'UÑAS' ? 'Camila' : 'Sofía';
      return {
        inicio,
        estado: estadoHistorico(cita.status),
        servicio: {
          id: base?.id ?? linea.id,
          categoria,
          subtipo: linea.name,
          duracionMinutos: linea.durationMinutes,
          precioBase: linea.price,
        },
        cliente: { nombre: cita.client.name },
        profesional,
      };
    });
  }

  private turnosDelMesSeleccionado(): TurnoHistorico[] {
    return this._turnos().filter((t) => this.mesKey(t.inicio) === this._mesSeleccionado());
  }

  private filtradosPorCategoria(): TurnoHistorico[] {
    return this.turnosDelMesSeleccionado().filter(
      (t) => this._categoriaSeleccionada() === 'TODAS' || t.servicio.categoria === this._categoriaSeleccionada(),
    );
  }
}
