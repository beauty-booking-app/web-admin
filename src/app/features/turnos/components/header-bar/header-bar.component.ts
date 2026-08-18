import { Component, computed, signal, inject, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TurnosStateService } from '../../services/turnos-state.service';
import { AgendaPdfService } from '../../services/agenda-pdf.service';

@Component({
  selector: 'app-header-bar',
  template: `
    <header class="h-16 border-b border-slate-200 bg-white/90 backdrop-blur px-6 flex items-center justify-between shrink-0 gap-4 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-lg px-4 h-9">
          <span class="text-rose-500 animate-pulse" aria-hidden="true">●</span>
          <div class="text-center leading-tight">
            <span class="text-xs font-bold text-slate-900 block">{{ fechaFormateada() }}</span>
          </div>
          <span class="text-xs font-bold text-slate-900 tabular-nums block">{{ horaActual() }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="exportarPdf()"
                class="flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold px-4 py-2 rounded-lg text-xs transition"
                aria-label="Exportar agenda del día en PDF">
          <span>🖨️</span>
          <span class="hidden sm:inline">EXPORTAR PDF</span>
        </button>

        <button (click)="onNuevoTurno.emit()"
                class="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-md shadow-rose-200 transition-all hover:scale-[1.02] active:scale-95"
                aria-label="Agendar nuevo turno">
          <span>+</span>
          <span>AGENDAR TURNO</span>
        </button>
      </div>
    </header>
  `,
})
export class HeaderBarComponent implements OnDestroy {
  @Output() readonly onNuevoTurno = new EventEmitter<void>();

  protected readonly turnosState = inject(TurnosStateService);
  private readonly agendaPdf = inject(AgendaPdfService);

  protected readonly horaActual = signal(this.obtenerHora());
  protected readonly fechaFormateada = computed(() => this.obtenerFecha(this.turnosState.fechaActual()));
  private readonly intervalId = setInterval(() => this.horaActual.set(this.obtenerHora()), 1000);

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  protected exportarPdf(): void {
    this.agendaPdf.exportarDia(this.turnosState.turnos());
  }

  private obtenerHora(): string {
    return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  private obtenerFecha(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const texto = fecha.toLocaleDateString('es-AR', opciones);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
