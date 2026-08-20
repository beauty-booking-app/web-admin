import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import {
  CalendarioService,
  lunesDe,
  type VistaCalendario,
} from '../services/calendario.service';
import { STATUS_CONFIG, type EstadoConfig } from '../components/status-config';
import { TurnoDetalleModalComponent } from '../components/turno-detalle-modal/turno-detalle-modal.component';
import type { Turno, EstadoTurno } from '../../../core/models/turno.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-calendario-page',
  imports: [LoadingComponent, TurnoDetalleModalComponent],
  template: `
    <div class="flex-1 min-h-0 overflow-y-auto pt-24 pb-8 p-6">
      <!-- Encabezado -->
      <header class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <button (click)="calendario.irHoy()"
                  class="px-4 py-2 rounded-lg text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition"
                  title="Ir a hoy" aria-label="Ir a hoy">
            Hoy
          </button>

          <div class="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1.5" role="group" aria-label="Cambiar vista">
            <button (click)="cambiarVista('semana')"
                    class="px-3 py-1 rounded text-xs font-bold transition"
                    [class.bg-white]="calendario.vista() === 'semana'"
                    [class.shadow-sm]="calendario.vista() === 'semana'"
                    [class.text-rose-600]="calendario.vista() === 'semana'"
                    [class.text-slate-600]="calendario.vista() !== 'semana'"
                    aria-label="Ver por semana">
              Semana
            </button>
            <button (click)="cambiarVista('mes')"
                    class="px-3 py-1 rounded text-xs font-bold transition"
                    [class.bg-white]="calendario.vista() === 'mes'"
                    [class.shadow-sm]="calendario.vista() === 'mes'"
                    [class.text-rose-600]="calendario.vista() === 'mes'"
                    [class.text-slate-600]="calendario.vista() !== 'mes'"
                    aria-label="Ver por mes">
              Mes
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
          <button (click)="calendario.irAnterior()"
                  class="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
                  title="Período anterior" aria-label="Período anterior">
            ‹
          </button>
          <h1 class="text-base font-bold text-slate-900 px-2 whitespace-nowrap">{{ calendario.labelPeriodo() }}</h1>
          <button (click)="calendario.irSiguiente()"
                  class="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
                  title="Período siguiente" aria-label="Período siguiente">
            ›
          </button>
        </div>
      </header>

      @if (calendario.error(); as err) {
        <div role="alert"
             class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 font-medium">
          Error al cargar el calendario: {{ err }}
        </div>
      }

      @if (calendario.cargando()) {
        <div class="bg-white border border-slate-200 rounded-xl p-10 shadow-sm">
          <app-loading texto="Cargando calendario…" />
        </div>
      } @else {
        @if (calendario.vista() === 'semana') {
          <section class="bg-white border border-slate-200 rounded-xl shadow-sm" role="grid"
                   aria-label="Calendario semanal">
            <div class="grid grid-cols-7 divide-x divide-slate-100">
              @for (dia of diasSemana(); track dia.getTime()) {
                @let lista = turnosDe(dia);
                <div class="flex flex-col min-w-0" [class.bg-rose-50/40]="esHoy(dia)">
                  <button (click)="abrirModalDia(dia)"
                          class="px-2 py-2 text-center border-b border-slate-100 hover:bg-slate-50 transition"
                          [attr.aria-label]="'Ver turnos del día ' + diaCorto(dia)">
                    <span class="block text-[10px] uppercase tracking-wide font-bold text-slate-500">{{ diaCorto(dia) }}</span>
                    <span class="block text-sm font-bold text-slate-800"
                          [class.text-rose-600]="esHoy(dia)">{{ dia.getDate() }}</span>
                  </button>
                  <div class="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-96 min-h-64">
                    @if (lista.length === 0) {
                      <p class="text-center text-[10px] text-slate-300 py-4">—</p>
                    } @else {
                      @for (turno of lista; track turno.id) {
                        @let cfg = statusConfig(turno.estado);
                        <button (click)="abrirModalDia(dia)"
                                class="w-full text-left rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition hover:border-rose-300"
                                [attr.aria-label]="turno.cliente.nombre + ', ' + turno.servicio.subtipo + ', ' + cfg.label">
                          <span class="block text-[10px] font-semibold tabular-nums text-slate-600">{{ formatHora(turno.inicio) }}</span>
                          <span class="block text-[11px] font-bold text-slate-800 truncate">{{ turno.cliente.nombre }}</span>
                          <span class="block text-[10px] text-slate-600 truncate">{{ turno.servicio.subtipo }}</span>
                          <span class="inline-block mt-1 text-[9px] px-1 py-0.5 rounded font-semibold"
                                [class]="cfg.bg + ' ' + cfg.text">{{ cfg.label }}</span>
                        </button>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </section>
        } @else {
          <section class="bg-white border border-slate-200 rounded-xl shadow-sm" role="grid"
                   aria-label="Calendario mensual">
            <div class="grid grid-cols-7 border-b border-slate-100">
              @for (d of nombresDias; track d) {
                <div class="px-2 py-2 text-center text-[10px] uppercase tracking-wide font-bold text-slate-500">{{ d }}</div>
              }
            </div>
            <div class="grid grid-cols-7">
              @for (celda of celdasMes(); track $index) {
                @if (celda) {
                  @let lista = turnosDe(celda);
                  @let hoy = esHoy(celda);
                  <button (click)="abrirModalDia(celda)"
                          class="relative min-h-32 p-1.5 border border-slate-100 text-left align-top transition flex flex-col gap-1 hover:bg-slate-50"
                          [class.ring-2]="hoy"
                          [class.ring-rose-600]="hoy"
                          [class.border-rose-600]="hoy"
                          [class.bg-rose-50]="hoy"
                          [attr.aria-label]="'Ver turnos del día ' + formatearFecha(celda) + (hoy ? ' (hoy)' : '')">
                    <span class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                          [class.text-slate-600]="!hoy"
                          [class.bg-rose-600]="hoy"
                          [class.text-white]="hoy">{{ celda.getDate() }}</span>
                    @for (turno of lista.slice(0, 3); track turno.id) {
                      @let cfg = statusConfig(turno.estado);
                      <span class="truncate rounded px-1 py-0.5 text-[9px] leading-tight font-medium"
                            [class]="cfg.bg + ' ' + cfg.text"
                            [title]="turno.cliente.nombre + ' · ' + turno.servicio.subtipo">
                        {{ formatHora(turno.inicio) }} {{ turno.cliente.nombre }}
                      </span>
                    }
                    @if (lista.length > 3) {
                      <span class="text-[9px] font-semibold text-slate-500 px-1">+{{ lista.length - 3 }} más</span>
                    }
                  </button>
                } @else {
                  <div class="min-h-32 border border-slate-100"></div>
                }
              }
            </div>
          </section>
        }
      }
    </div>

    @if (diaModal(); as dia) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
           (click)="cerrarModal()" role="dialog" aria-modal="true"
           [attr.aria-label]="'Turnos del día ' + formatearFecha(dia)">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]"
             (click)="$event.stopPropagation()">
          <header class="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Turnos del día</h2>
              <p class="text-sm text-slate-600">{{ formatearFecha(dia) }}</p>
            </div>
            <button (click)="cerrarModal()"
                    class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 text-xl leading-none"
                    aria-label="Cerrar">✕</button>
          </header>

          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            @if (turnosDe(dia).length === 0) {
              <p class="text-sm text-slate-600">No hay turnos este día.</p>
            } @else {
              @for (turno of turnosDe(dia); track turno.id) {
                @let cfg = statusConfig(turno.estado);
                <button (click)="abrirDetalle(turno)"
                        class="w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-rose-300 cursor-pointer"
                        [attr.aria-label]="'Gestionar turno de ' + turno.cliente.nombre">
                  <div class="w-16 shrink-0">
                    <p class="text-sm font-bold text-slate-900 tabular-nums">{{ formatHora(turno.inicio) }}</p>
                    <p class="text-xs text-slate-600 tabular-nums">{{ formatHora(turno.fin) }}</p>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-900 truncate">{{ turno.cliente.nombre }}</p>
                    <p class="text-xs text-slate-600 truncate">{{ turno.servicio.categoria }} · {{ turno.servicio.subtipo }}</p>
                    <p class="text-xs text-slate-600">{{ turno.profesional }}</p>
                  </div>
                  <span class="shrink-0 inline-block text-[10px] px-2 py-1 rounded font-semibold"
                        [class]="cfg.bg + ' ' + cfg.text">{{ cfg.label }}</span>
                </button>
              }
            }
          </div>

          <footer class="px-5 py-3 border-t border-slate-200 flex justify-end">
            <button (click)="cerrarModal()"
                    class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition">
              Cerrar
            </button>
          </footer>
        </div>
      </div>
    }

    <app-turno-detalle-modal #modalDetalle (onCambios)="recargar()" />
  `,
})
export class CalendarioPageComponent implements OnInit {
  protected readonly calendario = inject(CalendarioService);
  protected readonly diaModal = signal<Date | null>(null);
  @ViewChild('modalDetalle') private readonly modalDetalle!: TurnoDetalleModalComponent;

  protected readonly nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  ngOnInit(): void {
    void this.calendario.cargarPeriodo();
  }

  protected cambiarVista(vista: VistaCalendario): void {
    this.calendario.cambiarVista(vista);
  }

  protected abrirModalDia(fecha: Date): void {
    this.diaModal.set(fecha);
  }

  protected cerrarModal(): void {
    this.diaModal.set(null);
  }

  protected abrirDetalle(turno: Turno): void {
    this.diaModal.set(null);
    this.modalDetalle.abrir(turno);
  }

  protected recargar(): void {
    void this.calendario.cargarPeriodo();
  }

  protected diasSemana(): Date[] {
    const lunes = lunesDe(this.calendario.fechaAncla());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  }

  protected celdasMes(): (Date | null)[] {
    const ancla = this.calendario.fechaAncla();
    const primerDia = new Date(ancla.getFullYear(), ancla.getMonth(), 1);
    const offset = (primerDia.getDay() + 6) % 7;
    const totalDias = new Date(ancla.getFullYear(), ancla.getMonth() + 1, 0).getDate();
    const celdas: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) celdas.push(null);
    for (let d = 1; d <= totalDias; d++) {
      celdas.push(new Date(ancla.getFullYear(), ancla.getMonth(), d));
    }
    while (celdas.length % 7 !== 0) celdas.push(null);
    return celdas;
  }

  protected turnosDe(fecha: Date): Turno[] {
    return this.calendario.turnosDelDia(fecha);
  }

  protected esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  }

  protected diaCorto(fecha: Date): string {
    return fecha.toLocaleDateString('es-AR', { weekday: 'short' });
  }

  protected formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  }

  protected formatHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  protected statusConfig(estado: EstadoTurno): EstadoConfig {
    return STATUS_CONFIG[estado] ?? STATUS_CONFIG['Pendiente'];
  }
}
