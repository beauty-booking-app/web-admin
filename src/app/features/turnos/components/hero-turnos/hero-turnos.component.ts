import { Component, inject } from '@angular/core';
import { TurnosStateService } from '../../services/turnos-state.service';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';
import type { Turno } from '../../../../core/models/turno.model';

@Component({
  selector: 'app-hero-turnos',
  imports: [CurrencyArsPipe],
  template: `
    <section>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="flex h-3 w-3 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
          </span>
          <h2 class="text-xs font-bold tracking-wider text-slate-700 uppercase">Atención en Curso y Próximos 60 Minutos</h2>
        </div>
        <span class="text-xs text-slate-500 font-medium">
          {{ turnosInminentes().length }} Turnos requiriendo atención prioritaria
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (turno of turnosInminentes(); track turno.id) {
          <div class="bg-white border-2 rounded-xl p-4 relative overflow-hidden shadow-sm hover:shadow-md transition-all"
               [class.border-emerald-400]="turno.estado === 'En Proceso'"
               [class.border-rose-300]="turno.estado === 'Confirmado' && !esEnCurso(turno)"
               [class.border-amber-300]="turno.estado === 'Pendiente'">

            <!-- Badge de estado -->
            <div class="absolute top-0 right-0 text-white font-bold text-[10px] px-3 py-0.5 rounded-bl-lg uppercase tracking-wider shadow-sm flex items-center gap-1"
                 [class.bg-emerald-600]="turno.estado === 'En Proceso'"
                 [class.bg-rose-600]="turno.estado === 'Confirmado' && !esEnCurso(turno)"
                 [class.bg-amber-500]="turno.estado === 'Pendiente'">
              @if (turno.estado === 'En Proceso') {
                ▶ En Proceso
              } @else if (turno.estado === 'Pendiente') {
                Sin Confirmar
              } @else {
                Próximo ({{ minutosHasta(turno) }} min)
              }
            </div>

            <!-- Info del turno -->
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-xs font-mono font-bold"
                      [class.text-emerald-700]="turno.estado === 'En Proceso'"
                      [class.text-rose-700]="turno.estado === 'Confirmado' && !esEnCurso(turno)"
                      [class.text-amber-700]="turno.estado === 'Pendiente'">
                  {{ formatRangoHorario(turno) }}
                </span>
                <h3 class="font-bold text-slate-900 text-base mt-0.5">{{ turno.cliente.nombre }}</h3>
                <p class="text-xs text-slate-500">Tel: {{ turno.cliente.telefono }}</p>
              </div>
            </div>

            <!-- Detalles -->
            <div class="space-y-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-3">
              <div class="flex justify-between">
                <span class="text-slate-500">Servicio:</span>
                <span class="text-slate-900 font-semibold">{{ turno.servicio.categoria }} - {{ turno.servicio.subtipo }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Profesional:</span>
                <span class="font-bold"
                      [class.text-pink-600]="turno.profesional === 'Sofía'"
                      [class.text-emerald-600]="turno.profesional === 'Camila'">
                  {{ turno.profesional }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Precio:</span>
                <span class="text-emerald-600 font-bold">{{ turno.servicio.precioBase | currencyArs }}</span>
              </div>
            </div>

            <!-- Acción principal -->
            <div class="flex items-center justify-between gap-2 pt-1">
              @if (turno.estado === 'En Proceso') {
                <button (click)="finalizarTurno(turno)"
                        class="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs">
                  ✓ Finalizar y Cobrar
                </button>
              } @else if (turno.estado === 'Confirmado') {
                <button (click)="iniciarTurno(turno)"
                        class="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition shadow-md shadow-rose-100">
                  ▶ Iniciar Atención
                </button>
              } @else if (turno.estado === 'Pendiente') {
                <button (click)="enviarRecordatorio(turno)"
                        [disabled]="!turno.cliente.telefono"
                        class="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition shadow-md shadow-emerald-100">
                  📱 WhatsApp Recordatorio
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="col-span-3 bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
            <p class="text-slate-500 text-sm">No hay turnos inminentes en este momento.</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class HeroTurnosComponent {
  private readonly turnosState = inject(TurnosStateService);
  protected readonly turnosInminentes = this.turnosState.turnosInminentes;

  protected esEnCurso(turno: Turno): boolean {
    const ahora = new Date();
    return turno.inicio <= ahora && turno.fin > ahora;
  }

  protected minutosHasta(turno: Turno): number {
    const ahora = new Date();
    const diff = turno.inicio.getTime() - ahora.getTime();
    return Math.max(0, Math.round(diff / 60000));
  }

  protected formatRangoHorario(turno: Turno): string {
    const fmt = (d: Date) =>
      d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${fmt(turno.inicio)} - ${fmt(turno.fin)}`;
  }

  protected iniciarTurno(turno: Turno): void {
    this.turnosState.cambiarEstado(turno.id, 'En Proceso');
  }

  protected finalizarTurno(turno: Turno): void {
    this.turnosState.cambiarEstado(turno.id, 'Finalizado');
  }

  protected enviarRecordatorio(turno: Turno): void {
    if (!turno.cliente.telefono) return;
    this.turnosState.marcarRecordatorio(turno.id);
    this.turnosState.cambiarEstado(turno.id, 'Confirmado');
  }
}
