import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { hugeCancel01, hugeClock02, hugeDelete02, hugeRotateClockwise } from '@ng-icons/huge-icons';
import { TurnosStateService } from '../../services/turnos-state.service';
import { STATUS_CONFIG } from '../status-config';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';
import type { EstadoTurno, Turno } from '../../../../core/models/turno.model';

const ESTADOS_UI: EstadoTurno[] = [
  'Pendiente',
  'Confirmado',
  'Reprogramado',
  'En Proceso',
  'Finalizado',
  'Cancelado',
  'No Asiste',
];

function fechaISO(f: Date): string {
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

function horaHHMM(f: Date): string {
  return `${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-turno-detalle-modal',
  imports: [FormsModule, CurrencyArsPipe, NgIcon],
  providers: [provideIcons({ hugeCancel01, hugeClock02, hugeDelete02, hugeRotateClockwise })],
  template: `
    @if (turno(); as t) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
           (click)="cerrar()" role="dialog" aria-modal="true" aria-label="Detalle del turno">
        <div class="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ng-icon name="hugeClock02" size="16" class="shrink-0" /> Detalle del Turno
            </h3>
            <button (click)="cerrar()" class="text-slate-500 hover:text-slate-600 transition p-1"
                    aria-label="Cerrar modal"><ng-icon name="hugeCancel01" size="14" /></button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
            @if (error()) {
              <div role="alert"
                   class="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
                {{ error() }}
              </div>
            }

            <!-- Datos -->
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <p class="text-[10px] uppercase tracking-wide font-bold text-slate-500">Cliente</p>
                <p class="text-base font-bold text-slate-900">{{ t.cliente.nombre }}</p>
                @if (t.cliente.telefono) {
                  <p class="text-xs text-slate-600">{{ t.cliente.telefono }}</p>
                }
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wide font-bold text-slate-500">Servicio</p>
                <p class="font-semibold text-slate-900">{{ t.servicio.subtipo }}</p>
                <p class="text-xs text-slate-600">{{ t.servicio.categoria }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wide font-bold text-slate-500">Profesional</p>
                <p class="font-semibold text-slate-900">{{ t.profesional }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wide font-bold text-slate-500">Horario</p>
                <p class="font-semibold text-slate-900 tabular-nums">{{ formatoFecha(t.inicio) }}</p>
                <p class="text-xs text-slate-600 tabular-nums">{{ horaHHMM(t.inicio) }} – {{ horaHHMM(t.fin) }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wide font-bold text-slate-500">Precio</p>
                <p class="font-semibold text-slate-900">{{ t.servicio.precioBase | currencyArs }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-[10px] uppercase tracking-wide font-bold text-slate-500">Estado</p>
                <span class="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded font-semibold"
                      [class]="cfgAtual(t).bg + ' ' + cfgAtual(t).text">{{ cfgAtual(t).label }}</span>
              </div>
            </div>

            <!-- Cambiar estado -->
            <div class="pt-3 border-t border-slate-100">
              <label class="block text-[10px] uppercase tracking-wide font-bold text-slate-500 mb-1" for="detalle-estado">
                Cambiar estado
              </label>
              <div class="flex gap-2">
                <select id="detalle-estado"
                        [(ngModel)]="nuevoEstado" name="nuevoEstado"
                        class="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
                  @for (e of estados; track e) {
                    <option [value]="e">{{ e }}</option>
                  }
                </select>
                <button (click)="aplicarEstado()" [disabled]="ocupado()"
                        class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition disabled:opacity-50">
                  Aplicar
                </button>
              </div>
            </div>

            <!-- Reprogramar -->
            <div class="pt-3 border-t border-slate-100">
              <p class="text-[10px] uppercase tracking-wide font-bold text-slate-500 mb-1">Reprogramar</p>
              @if (!reprogramando()) {
                <button (click)="reprogramando.set(true)"
                        class="text-xs font-semibold text-rose-700 hover:text-rose-800 transition">
                  <ng-icon name="hugeRotateClockwise" size="14" class="align-[-2px]" /> Reprogramar este turno
                </button>
              } @else {
                <div class="space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-medium text-slate-600 mb-0.5" for="detalle-fecha">Fecha</label>
                      <input id="detalle-fecha" type="date" required
                             [(ngModel)]="nuevaFecha" name="nuevaFecha"
                             class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs">
                    </div>
                    <div>
                      <label class="block text-[10px] font-medium text-slate-600 mb-0.5" for="detalle-hora">Hora</label>
                      <input id="detalle-hora" type="time" required
                             [(ngModel)]="nuevaHora" name="nuevaHora"
                             class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs">
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="reprogramando.set(false)"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
                      Cancelar
                    </button>
                    <button (click)="aplicarReprogramacion()" [disabled]="ocupado()"
                            class="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition disabled:opacity-50">
                      Confirmar reprogramación
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Acciones destructivas -->
            <div class="pt-3 border-t border-slate-100 flex flex-col gap-2">
              @if (confirmandoEliminar()) {
                <div class="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                  <p class="text-xs font-medium text-red-700">
                    ¿ Eliminar este servicio / cancelar el turno? Esta acción no se puede deshacer.
                  </p>
                  <div class="flex gap-2">
                    <button (click)="confirmandoEliminar.set(false)"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-red-100 transition">
                      No
                    </button>
                    <button (click)="eliminarServicio()" [disabled]="ocupado()"
                            class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-50">
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              } @else {
                <button (click)="confirmandoEliminar.set(true)"
                        class="text-xs font-semibold text-red-600 hover:text-red-700 transition text-left">
                  <ng-icon name="hugeDelete02" size="14" class="align-[-2px]" /> Eliminar servicio
                </button>
              }
            </div>
          </div>

          <footer class="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
            @if (confirmandoCancelar()) {
              <span class="text-xs font-medium text-slate-600 self-center">¿Cancelar todo el turno?</span>
              <button (click)="confirmandoCancelar.set(false)"
                      class="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-100 transition">
                No
              </button>
              <button (click)="cancelarTurno()" [disabled]="ocupado()"
                      class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-50">
                Sí, cancelar
              </button>
            } @else {
              <button (click)="confirmandoCancelar.set(true)"
                      class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition">
                Cancelar turno
              </button>
            }
          </footer>
        </div>
      </div>
    }
  `,
})
export class TurnoDetalleModalComponent {
  private readonly turnosState = inject(TurnosStateService);

  private readonly _turno = signal<Turno | null>(null);
  readonly turno = this._turno.asReadonly();

  readonly onCambios = output<void>();
  readonly onCerrar = output<void>();

  protected readonly estados = ESTADOS_UI;
  protected nuevoEstado: EstadoTurno = 'Pendiente';
  protected nuevaFecha = '';
  protected nuevaHora = '';

  protected reprogramando = signal(false);
  protected confirmandoCancelar = signal(false);
  protected confirmandoEliminar = signal(false);
  protected ocupado = signal(false);
  protected error = signal<string | null>(null);

  abrir(turno: Turno): void {
    this._turno.set(turno);
    this.nuevoEstado = turno.estado;
    this.nuevaFecha = fechaISO(turno.inicio);
    this.nuevaHora = horaHHMM(turno.inicio);
    this.reprogramando.set(false);
    this.confirmandoCancelar.set(false);
    this.confirmandoEliminar.set(false);
    this.error.set(null);
  }

  cerrar(): void {
    this._turno.set(null);
    this.onCerrar.emit();
  }

  protected cfgAtual(t: Turno) {
    return STATUS_CONFIG[t.estado] ?? STATUS_CONFIG['Pendiente'];
  }

  protected formatoFecha(f: Date): string {
    return f.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  protected horaHHMM(f: Date): string {
    return horaHHMM(f);
  }

  protected async aplicarEstado(): Promise<void> {
    const t = this._turno();
    if (!t || this.nuevoEstado === t.estado) return;
    this.ocupado.set(true);
    this.error.set(null);
    try {
      this.turnosState.cambiarEstado(t.id, this.nuevoEstado);
      this._turno.set({ ...t, estado: this.nuevoEstado });
      this.onCambios.emit();
    } catch {
      this.error.set('No se pudo cambiar el estado del turno.');
    } finally {
      this.ocupado.set(false);
    }
  }

  protected async aplicarReprogramacion(): Promise<void> {
    const t = this._turno();
    if (!t || !this.nuevaFecha || !this.nuevaHora) return;
    this.ocupado.set(true);
    this.error.set(null);
    try {
      await this.turnosState.reprogramarTurno(t.id, this.nuevaFecha, this.nuevaHora);
      this.reprogramando.set(false);
      this.onCambios.emit();
      this.cerrar();
    } catch {
      this.error.set('No se pudo reprogramar el turno (verificá disponibilidad).');
    } finally {
      this.ocupado.set(false);
    }
  }

  protected async cancelarTurno(): Promise<void> {
    const t = this._turno();
    if (!t) return;
    this.ocupado.set(true);
    this.error.set(null);
    try {
      await this.turnosState.cancelarTurno(t.id, 'Cancelado desde el panel');
      this._turno.set({ ...t, estado: 'Cancelado' });
      this.confirmandoCancelar.set(false);
      this.onCambios.emit();
    } catch {
      this.error.set('No se pudo cancelar el turno.');
    } finally {
      this.ocupado.set(false);
    }
  }

  protected async eliminarServicio(): Promise<void> {
    const t = this._turno();
    if (!t) return;
    this.ocupado.set(true);
    this.error.set(null);
    try {
      // Modelo de un solo servicio por turno: eliminar el servicio cancela el turno.
      await this.turnosState.cancelarTurno(t.id, 'Servicio eliminado desde el panel');
      this._turno.set({ ...t, estado: 'Cancelado' });
      this.confirmandoEliminar.set(false);
      this.onCambios.emit();
    } catch {
      this.error.set('No se pudo eliminar el servicio.');
    } finally {
      this.ocupado.set(false);
    }
  }
}
