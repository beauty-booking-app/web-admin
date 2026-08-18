import { Component, inject, computed } from '@angular/core';
import { RecordatorioService } from '../services/recordatorio.service';
import { CurrencyArsPipe } from '../../../shared/pipes/currency-ars.pipe';
import type { Turno } from '../../../core/models/turno.model';

@Component({
  selector: 'app-recordatorios-page',
  imports: [CurrencyArsPipe],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Recordatorios</h2>
          <p class="text-xs text-slate-500 mt-1">
            Enviá recordatorios por WhatsApp a los turnos pendientes de confirmar.
          </p>
        </div>
        <button (click)="enviarTodos()"
                [disabled]="sinPendientes()"
                class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg text-xs shadow-md shadow-emerald-100 transition flex items-center gap-2"
                aria-label="Enviar todos los recordatorios pendientes por WhatsApp">
          📱 Enviar Todos por WhatsApp
        </button>
      </div>

      <!-- Toast de confirmación -->
      @if (mostrarToast()) {
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2 text-xs text-emerald-800 font-medium"
             role="status"
             aria-live="polite">
          <span class="text-base">✅</span>
          Recordatorios enviados correctamente.
        </div>
      }

      <!-- Lista de pendientes -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-bold text-slate-900 text-xs tracking-wide">Turnos Pendientes de Confirmar</h3>
          <span class="text-[11px] text-slate-500 font-medium">
            {{ turnosPendientes().length }} por enviar
          </span>
        </div>

        @if (turnosPendientes().length === 0) {
          <div class="p-8 text-center">
            <p class="text-slate-500 text-sm">No hay turnos pendientes de confirmar.</p>
          </div>
        } @else {
          <ul class="divide-y divide-slate-100">
            @for (turno of turnosPendientes(); track turno.id) {
              <li class="px-5 py-3.5">
                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold text-slate-900 truncate">{{ turno.cliente.nombre }}</p>
                      @if (yaEnviado(turno.id)) {
                        <span class="shrink-0 px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          Enviado
                        </span>
                      }
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      {{ formatHora(turno) }} · {{ turno.servicio.categoria }} - {{ turno.servicio.subtipo }}
                    </p>
                    <p class="text-xs text-slate-500">{{ turno.cliente.telefono }}</p>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-xs text-slate-500 font-medium">{{ turno.servicio.precioBase | currencyArs }}</span>
                    <button (click)="enviarIndividual(turno)"
                            [disabled]="yaEnviado(turno.id)"
                            class="bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-800 border border-emerald-300 py-2 px-3 rounded-lg text-xs font-semibold transition shadow-xs"
                            [attr.aria-label]="'Enviar recordatorio por WhatsApp a ' + turno.cliente.nombre">
                      📱 Enviar Individual
                    </button>
                  </div>
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class RecordatoriosPageComponent {
  private readonly recordatorioService = inject(RecordatorioService);

  protected readonly turnosPendientes = this.recordatorioService.turnosPendientes;
  protected readonly sinPendientes = computed(() => this.turnosPendientes().length === 0);
  protected readonly mostrarToast = this.recordatorioService.enviados;

  protected yaEnviado(turnoId: string): boolean {
    return this.recordatorioService.enviados().includes(turnoId);
  }

  protected formatHora(turno: Turno): string {
    return turno.inicio.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  protected enviarIndividual(turno: Turno): void {
    this.recordatorioService.enviarIndividual(turno);
  }

  protected enviarTodos(): void {
    this.recordatorioService.enviarTodos();
  }
}