import { Component, inject, OnInit } from '@angular/core';
import {
  CalendarioService,
  lunesDe,
  type VistaCalendario,
} from '../services/calendario.service';
import { STATUS_CONFIG, type EstadoConfig } from '../components/status-config';
import type { Turno, EstadoTurno } from '../../../core/models/turno.model';

@Component({
  selector: 'app-calendario-page',
  template: `
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Encabezado -->
      <header class="flex flex-wrap items-center justify-between gap-4">
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
                    [class.text-slate-500]="calendario.vista() !== 'semana'"
                    aria-label="Ver por semana">
              Semana
            </button>
            <button (click)="cambiarVista('mes')"
                    class="px-3 py-1 rounded text-xs font-bold transition"
                    [class.bg-white]="calendario.vista() === 'mes'"
                    [class.shadow-sm]="calendario.vista() === 'mes'"
                    [class.text-rose-600]="calendario.vista() === 'mes'"
                    [class.text-slate-500]="calendario.vista() !== 'mes'"
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
        <div class="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500 shadow-sm">
          Cargando calendario…
        </div>
      } @else {
        @if (calendario.vista() === 'semana') {
          <section class="bg-white border border-slate-200 rounded-xl shadow-sm" role="grid"
                   aria-label="Calendario semanal">
            <div class="grid grid-cols-7 divide-x divide-slate-100">
              @for (dia of diasSemana(); track dia.getTime()) {
                @let lista = turnosDe(dia);
                <div class="flex flex-col min-w-0" [class.bg-rose-50/40]="esHoy(dia)">
                  <button (click)="irAlDia(dia)"
                          class="px-2 py-2 text-center border-b border-slate-100 hover:bg-slate-50 transition"
                          [attr.aria-label]="'Ir a la agenda del día ' + diaCorto(dia)">
                    <span class="block text-[10px] uppercase tracking-wide font-bold text-slate-400">{{ diaCorto(dia) }}</span>
                    <span class="block text-sm font-bold text-slate-800"
                          [class.text-rose-600]="esHoy(dia)">{{ dia.getDate() }}</span>
                  </button>
                  <div class="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-96 min-h-64">
                    @if (lista.length === 0) {
                      <p class="text-center text-[10px] text-slate-300 py-4">—</p>
                    } @else {
                      @for (turno of lista; track turno.id) {
                        @let cfg = statusConfig(turno.estado);
                        <button (click)="irAlDia(dia)"
                                class="w-full text-left rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition hover:border-rose-300"
                                [attr.aria-label]="turno.cliente.nombre + ', ' + turno.servicio.subtipo + ', ' + cfg.label">
                          <span class="block text-[10px] font-semibold tabular-nums text-slate-500">{{ formatHora(turno.inicio) }}</span>
                          <span class="block text-[11px] font-bold text-slate-800 truncate">{{ turno.cliente.nombre }}</span>
                          <span class="block text-[10px] text-slate-500 truncate">{{ turno.servicio.subtipo }}</span>
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
                <div class="px-2 py-2 text-center text-[10px] uppercase tracking-wide font-bold text-slate-400">{{ d }}</div>
              }
            </div>
            <div class="grid grid-cols-7">
              @for (celda of celdasMes(); track $index) {
                @if (celda) {
                  @let lista = turnosDe(celda);
                  <button (click)="irAlDia(celda)"
                          class="min-h-32 p-1.5 border border-slate-100 text-left align-top transition hover:bg-rose-50/40 flex flex-col gap-1"
                          [class.bg-rose-50/40]="esHoy(celda)"
                          [attr.aria-label]="'Ir a la agenda del día ' + formatearFecha(celda)">
                    <span class="text-xs font-bold text-slate-600"
                          [class.text-rose-600]="esHoy(celda)">{{ celda.getDate() }}</span>
                    @for (turno of lista.slice(0, 3); track turno.id) {
                      @let cfg = statusConfig(turno.estado);
                      <span class="truncate rounded px-1 py-0.5 text-[9px] leading-tight font-medium"
                            [class]="cfg.bg + ' ' + cfg.text"
                            [title]="turno.cliente.nombre + ' · ' + turno.servicio.subtipo">
                        {{ formatHora(turno.inicio) }} {{ turno.cliente.nombre }}
                      </span>
                    }
                    @if (lista.length > 3) {
                      <span class="text-[9px] font-semibold text-slate-400 px-1">+{{ lista.length - 3 }} más</span>
                    }
                  </button>
                } @else {
                  <div class="min-h-32 bg-slate-50/60 border border-slate-100"></div>
                }
              }
            </div>
          </section>
        }
      }
    </div>
  `,
})
export class CalendarioPageComponent implements OnInit {
  protected readonly calendario = inject(CalendarioService);

  protected readonly nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  ngOnInit(): void {
    void this.calendario.cargarPeriodo();
  }

  protected cambiarVista(vista: VistaCalendario): void {
    this.calendario.cambiarVista(vista);
  }

  protected irAlDia(fecha: Date): void {
    void this.calendario.irAlDia(fecha);
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
