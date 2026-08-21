import { Component, inject, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { hugeUser } from '@ng-icons/huge-icons';
import { TurnosStateService } from '../../services/turnos-state.service';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';
import { STATUS_CONFIG, CATEGORY_CONFIG, type EstadoConfig } from '../status-config';
import type { Turno, EstadoTurno } from '../../../../core/models/turno.model';

@Component({
  selector: 'app-timeline',
  imports: [CurrencyArsPipe, NgIcon],
  providers: [provideIcons({ hugeUser })],
  template: `
    <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h2 class="text-base font-bold text-slate-900">Agenda del Día</h2>
        </div>
      </div>

      @if (turnosOrdenados().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p class="text-sm text-amber-600">La agenda del día está vacía.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <!-- Columna: Servicios Generales -->
          <div>
            <div class="bg-amber-100 p-2 rounded-lg text-center mb-4">
              <p class="font-bold text-amber-900">Peluquería</p>
            </div>

            @if (serviciosGenerales().length === 0) {
              <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <p class="text-xs text-slate-500">Sin turnos de peluquería hoy</p>
              </div>
            } @else {
              <div class="relative">
                <div class="absolute left-[44px] top-2 bottom-2 w-px bg-slate-200 hidden sm:block"></div>
                <div class="space-y-2">
                  @for (turno of serviciosGenerales(); track turno.id) {
                    @let cfg = statusConfig(turno.estado);
                    @let cat = categoryConfig(turno.servicio.categoria);
                    @let esPasado = turno.estado === 'Finalizado' || turno.estado === 'Cancelado' || turno.estado === 'No Asiste';
                    @let esAhora = turno.estado === 'En Proceso';

                    <div class="relative flex gap-2.5 sm:gap-3 rounded-xl border bg-white p-2.5 transition-opacity text-[13px] cursor-pointer hover:border-rose-300"
                         [class.opacity-55]="esPasado"
                         [class.border-amber-300]="esAhora"
                         [class.shadow-sm]="esAhora"
                         [class.border-slate-200]="!esAhora"
                         role="button"
                         tabindex="0"
                         (click)="onTurnoClick.emit(turno)"
                         (keydown.enter)="onTurnoClick.emit(turno)"
                         [attr.aria-label]="'Gestionar turno: ' + turno.cliente.nombre + ', ' + turno.servicio.subtipo + ', ' + turno.estado">

                      <div class="w-14 sm:w-[52px] shrink-0 text-right pt-0.5">
                        <p class="text-xs font-semibold tabular-nums text-slate-900">{{ formatHora(turno.inicio) }}</p>
                        <p class="text-[10px] text-slate-500 tabular-nums">{{ formatHora(turno.fin) }}</p>
                      </div>

                      <div class="hidden sm:flex items-start pt-1.5">
                        <span class="w-2 h-2 rounded-full ring-3 ring-white"
                              [class.animate-pulse]="esAhora"
                              [class.bg-emerald-500]="turno.estado === 'En Proceso'"
                              [class.bg-purple-500]="turno.estado === 'Confirmado'"
                              [class.bg-amber-500]="turno.estado === 'Pendiente'"
                              [class.bg-slate-400]="turno.estado === 'Finalizado'"
                              [class.bg-red-400]="turno.estado === 'Cancelado'"
                              [class.bg-blue-500]="turno.estado === 'Reprogramado'"
                              [class.bg-orange-400]="turno.estado === 'No Asiste'">
                        </span>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <span class="text-[9px] px-1 py-0.5 rounded border font-medium"
                                [class]="cat.bg + ' ' + cat.text">
                            {{ cat.label }}
                          </span>
                          <span class="text-[9px] px-1 py-0.5 rounded font-semibold"
                                [class]="cfg.bg + ' ' + cfg.text">
                            {{ cfg.label }}
                          </span>
                          <span class="text-[10px] text-slate-500">{{ turno.profesional }}</span>
                        </div>
                        <p class="font-bold text-slate-900 leading-tight">{{ turno.servicio.subtipo }}</p>
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-0 text-[11px] text-slate-600 mt-0.5">
                          <span class="inline-flex items-center gap-1"><ng-icon name="hugeUser" size="12" class="shrink-0" /> {{ turno.cliente.nombre }}</span>
                          <span class="font-medium text-slate-700 tabular-nums">{{ turno.servicio.precioBase | currencyArs }}</span>
                        </div>
                      </div>

                      @if (!esPasado) {
                        <div class="flex flex-col gap-1 shrink-0">
                          @if (turno.estado === 'Pendiente') {
                            <button (click)="confirmarTurno(turno); $event.stopPropagation()"
                                    class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium whitespace-nowrap">
                              Confirmar
                            </button>
                          }
                          @if (turno.estado === 'Confirmado') {
                            <button (click)="iniciarTurno(turno); $event.stopPropagation()"
                                    class="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium whitespace-nowrap">
                              Iniciar
                            </button>
                          }
                          @if (turno.estado === 'En Proceso') {
                            <button (click)="completarTurno(turno); $event.stopPropagation()"
                                    class="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors font-medium whitespace-nowrap">
                              Completar
                            </button>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Columna: Uñas -->
          <div>
            <div class="bg-purple-100 p-2 rounded-lg text-center mb-4">
              <p class="font-bold text-purple-900">Manicura</p>
            </div>

            @if (serviciosUnas().length === 0) {
              <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <p class="text-xs text-slate-500">Sin turnos de uñas hoy</p>
              </div>
            } @else {
              <div class="relative">
                <div class="absolute left-[44px] top-2 bottom-2 w-px bg-emerald-200 hidden sm:block"></div>
                <div class="space-y-2">
                  @for (turno of serviciosUnas(); track turno.id) {
                    @let cfg = statusConfig(turno.estado);
                    @let cat = categoryConfig(turno.servicio.categoria);
                    @let esPasado = turno.estado === 'Finalizado' || turno.estado === 'Cancelado' || turno.estado === 'No Asiste';
                    @let esAhora = turno.estado === 'En Proceso';

                    <div class="relative flex gap-2.5 sm:gap-3 rounded-xl border bg-white p-2.5 transition-opacity text-[13px] cursor-pointer hover:border-rose-300"
                         [class.opacity-55]="esPasado"
                         [class.border-amber-300]="esAhora"
                         [class.shadow-sm]="esAhora"
                         [class.border-slate-200]="!esAhora"
                         role="button"
                         tabindex="0"
                         (click)="onTurnoClick.emit(turno)"
                         (keydown.enter)="onTurnoClick.emit(turno)"
                         [attr.aria-label]="'Gestionar turno: ' + turno.cliente.nombre + ', ' + turno.servicio.subtipo + ', ' + turno.estado">

                      <div class="w-14 sm:w-[52px] shrink-0 text-right pt-0.5">
                        <p class="text-xs font-semibold tabular-nums text-slate-900">{{ formatHora(turno.inicio) }}</p>
                        <p class="text-[10px] text-slate-500 tabular-nums">{{ formatHora(turno.fin) }}</p>
                      </div>

                      <div class="hidden sm:flex items-start pt-1.5">
                        <span class="w-2 h-2 rounded-full ring-3 ring-white"
                              [class.animate-pulse]="esAhora"
                              [class.bg-emerald-500]="turno.estado === 'En Proceso'"
                              [class.bg-purple-500]="turno.estado === 'Confirmado'"
                              [class.bg-amber-500]="turno.estado === 'Pendiente'"
                              [class.bg-slate-400]="turno.estado === 'Finalizado'"
                              [class.bg-red-400]="turno.estado === 'Cancelado'"
                              [class.bg-blue-500]="turno.estado === 'Reprogramado'"
                              [class.bg-orange-400]="turno.estado === 'No Asiste'">
                        </span>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <span class="text-[9px] px-1 py-0.5 rounded border font-medium"
                                [class]="cat.bg + ' ' + cat.text">
                            {{ cat.label }}
                          </span>
                          <span class="text-[9px] px-1 py-0.5 rounded font-semibold"
                                [class]="cfg.bg + ' ' + cfg.text">
                            {{ cfg.label }}
                          </span>
                          <span class="text-[10px] text-slate-500">{{ turno.profesional }}</span>
                        </div>
                        <p class="font-bold text-slate-900 leading-tight">{{ turno.servicio.subtipo }}</p>
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-0 text-[11px] text-slate-600 mt-0.5">
                          <span class="inline-flex items-center gap-1"><ng-icon name="hugeUser" size="12" class="shrink-0" /> {{ turno.cliente.nombre }}</span>
                          <span class="font-medium text-slate-700 tabular-nums">{{ turno.servicio.precioBase | currencyArs }}</span>
                        </div>
                      </div>

                      @if (!esPasado) {
                        <div class="flex flex-col gap-1 shrink-0">
                          @if (turno.estado === 'Pendiente') {
                            <button (click)="confirmarTurno(turno); $event.stopPropagation()"
                                    class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium whitespace-nowrap">
                              Confirmar
                            </button>
                          }
                          @if (turno.estado === 'Confirmado') {
                            <button (click)="iniciarTurno(turno); $event.stopPropagation()"
                                    class="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium whitespace-nowrap">
                              Iniciar
                            </button>
                          }
                          @if (turno.estado === 'En Proceso') {
                            <button (click)="completarTurno(turno); $event.stopPropagation()"
                                    class="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors font-medium whitespace-nowrap">
                              Completar
                            </button>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

        </div>
      }
    </section>
  `,
})
export class TimelineComponent {
  readonly turnosState = inject(TurnosStateService);
  readonly onTurnoClick = output<Turno>();

  private readonly esUnas = (t: Turno): boolean => t.servicio.categoria === 'UÑAS';

  protected readonly serviciosGenerales = (): Turno[] => {
    return [...this.turnosState.turnosFiltrados()]
      .filter((t) => !this.esUnas(t))
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  };

  protected readonly serviciosUnas = (): Turno[] => {
    return [...this.turnosState.turnosFiltrados()]
      .filter((t) => this.esUnas(t))
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  };

  protected readonly turnosOrdenados = (): Turno[] => {
    return [...this.turnosState.turnosFiltrados()].sort(
      (a, b) => a.inicio.getTime() - b.inicio.getTime(),
    );
  };

  protected statusConfig(estado: EstadoTurno): EstadoConfig {
    return STATUS_CONFIG[estado] ?? STATUS_CONFIG['Pendiente'];
  }

  protected categoryConfig(categoria: string): { label: string; bg: string; text: string } {
    return CATEGORY_CONFIG[categoria] ?? { label: categoria, bg: 'bg-slate-50', text: 'text-slate-700' };
  }

  protected formatHora(fecha: Date): string {
    return new Date(fecha).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  protected iniciarTurno(turno: Turno): void {
    this.turnosState.cambiarEstado(turno.id, 'En Proceso');
  }

  protected completarTurno(turno: Turno): void {
    this.turnosState.cambiarEstado(turno.id, 'Finalizado');
  }

  protected confirmarTurno(turno: Turno): void {
    this.turnosState.cambiarEstado(turno.id, 'Confirmado');
  }
}
