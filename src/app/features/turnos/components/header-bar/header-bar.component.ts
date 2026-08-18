import { Component, signal, inject, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TurnosStateService } from '../../services/turnos-state.service';
import { AgendaPdfService } from '../../services/agenda-pdf.service';

@Component({
  selector: 'app-header-bar',
  template: `
    <header class="h-16 border-b border-slate-200 bg-white/90 backdrop-blur px-6 flex items-center justify-between shrink-0 gap-4 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg p-1.5">
          <button class="p-1 rounded hover:bg-slate-200 text-slate-600 transition" title="Día Anterior" aria-label="Día anterior">
            ‹
          </button>
          <div class="px-2 text-center">
            <span class="text-xs font-bold text-slate-900 block">{{ fechaFormateada() }}</span>
          </div>
          <button class="p-1 rounded hover:bg-slate-200 text-slate-600 transition" title="Día Siguiente" aria-label="Día siguiente">
            ›
          </button>
        </div>

        <div class="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span class="text-rose-600 animate-pulse">●</span>
          <span>Hora Actual:</span>
          <span class="font-bold text-slate-900">{{ horaActual() }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          <input type="text"
                 placeholder="Buscar cliente, profesional..."
                 class="pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 w-48 lg:w-64 transition"
                 aria-label="Buscar turno">
        </div>

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

  private readonly turnosState = inject(TurnosStateService);
  private readonly agendaPdf = inject(AgendaPdfService);

  protected readonly horaActual = signal(this.obtenerHora());
  protected readonly fechaFormateada = signal(this.obtenerFecha());
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

  private obtenerFecha(): string {
    const ahora = new Date();
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const fecha = ahora.toLocaleDateString('es-AR', opciones);
    return `Hoy, ${fecha.charAt(0).toUpperCase() + fecha.slice(1)}`;
  }
}
