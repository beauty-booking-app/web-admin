import { Component, inject, OnInit } from '@angular/core';
import { HorariosService } from '../services/horarios.service';
import type { DiaSemana } from '../../../core/models/franja-laboral.model';

@Component({
  selector: 'app-horarios-page',
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Horarios y Ausencias</h2>
          <p class="text-xs text-slate-500 mt-1">
            Configurá los horarios de atención del salón.
          </p>
        </div>
        <button (click)="guardar()"
                [disabled]="horariosService.cargando() || horariosService.franjas().length === 0"
                class="bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-md shadow-rose-200 transition flex items-center gap-2"
                aria-label="Guardar cambios de horario">
          Guardar Cambios de Horario
        </button>
      </div>

      @if (horariosService.error(); as err) {
        <div role="alert"
             class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 font-medium">
          Error: {{ err }}
        </div>
      }

      <!-- Toast de confirmación -->
      @if (horariosService.guardado()) {
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2 text-xs text-emerald-800 font-medium"
             role="status"
             aria-live="polite">
          <span class="text-base">✅</span>
          Configuración de horarios guardada correctamente.
        </div>
      }

      @if (horariosService.cargando()) {
        <div class="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500 shadow-sm">
          Cargando horarios…
        </div>
      } @else if (horariosService.franjas().length === 0 && !horariosService.error()) {
        <div class="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500 shadow-sm">
          No hay horarios cargados.
        </div>
      } @else {

      <!-- Franjas laborales -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <h3 class="font-bold text-slate-900 text-xs tracking-wide">Franjas Laborales</h3>
          <p class="text-[11px] text-slate-500 mt-0.5">
            {{ horariosService.diasActivos() }} de 7 días activos
          </p>
        </div>

        <div class="divide-y divide-slate-100">
          @for (franja of horariosService.franjas(); track franja.dia) {
            <div class="px-5 py-3.5 flex items-center gap-4"
                 [class.opacity-50]="!franja.activo">
              <!-- Toggle -->
              <button (click)="horariosService.toggleDia(franja.dia)"
                      class="relative w-10 h-5 rounded-full transition-colors shrink-0"
                      [class.bg-rose-600]="franja.activo"
                      [class.bg-slate-300]="!franja.activo"
                      role="switch"
                      [attr.aria-checked]="franja.activo"
                      [attr.aria-label]="'Activar ' + franja.dia">
                <span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                      [class.translate-x-5]="franja.activo"></span>
              </button>

              <!-- Día -->
              <div class="w-28 shrink-0">
                <p class="text-xs font-semibold text-slate-900">{{ franja.dia }}</p>
              </div>

              <!-- Horarios o "No Laboral" -->
              @if (franja.activo) {
                <div class="flex items-center gap-2 text-xs">
                  <input type="time"
                         [value]="franja.horaInicio"
                         (change)="onHoraChange(franja.dia, 'horaInicio', $event)"
                         class="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition"
                         [attr.aria-label]="'Hora de inicio ' + franja.dia">
                  <span class="text-slate-400 font-medium">a</span>
                  <input type="time"
                         [value]="franja.horaFin"
                         (change)="onHoraChange(franja.dia, 'horaFin', $event)"
                         class="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition"
                         [attr.aria-label]="'Hora de fin ' + franja.dia">
                </div>
              } @else {
                <span class="text-xs text-slate-400 font-medium italic">No Laboral</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Resumen -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-xs text-slate-600">
        <p class="font-medium text-slate-700 mb-2">Días cerrados:</p>
        @if (horariosService.diasCerrados().length > 0) {
          <div class="flex flex-wrap gap-2">
            @for (dia of horariosService.diasCerrados(); track dia.dia) {
              <span class="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-medium text-[11px]">
                {{ dia.dia }}
              </span>
            }
          </div>
        } @else {
          <p class="text-slate-400 italic">No hay días cerrados configurados.</p>
        }
      </div>
      }
    </div>
  `,
})
export class HorariosPageComponent implements OnInit {
  readonly horariosService = inject(HorariosService);

  ngOnInit(): void {
    void this.horariosService.cargarFranjas();
  }

  protected onHoraChange(dia: DiaSemana, campo: 'horaInicio' | 'horaFin', event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.horariosService.actualizarHora(dia, campo, valor);
  }

  protected guardar(): void {
    void this.horariosService.guardar();
  }
}
