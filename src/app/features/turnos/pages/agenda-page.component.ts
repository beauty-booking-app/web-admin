import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { HeaderBarComponent } from '../components/header-bar/header-bar.component';
import { HeroTurnosComponent } from '../components/hero-turnos/hero-turnos.component';
import { TimelineComponent } from '../components/timeline/timeline.component';
import { TurnoFormModalComponent } from '../components/turno-form-modal/turno-form-modal.component';
import { TurnoDetalleModalComponent } from '../components/turno-detalle-modal/turno-detalle-modal.component';
import { TurnosStateService } from '../services/turnos-state.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import type { Turno } from '../../../core/models/turno.model';

@Component({
  selector: 'app-agenda-page',
  imports: [
    HeaderBarComponent,
    HeroTurnosComponent,
    TimelineComponent,
    TurnoFormModalComponent,
    TurnoDetalleModalComponent,
    LoadingComponent,
  ],
  template: `
    <app-header-bar (onNuevoTurno)="modalTurno.abrir()" />

    <div class="flex-1 overflow-y-auto p-6 space-y-8">
      @if (turnosState.error(); as err) {
        <div role="alert"
             class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 font-medium">
          Error al cargar la agenda: {{ err }}
        </div>
      }

      @if (turnosState.cargando()) {
        <div class="bg-white border border-slate-200 rounded-xl p-10 shadow-sm">
          <app-loading texto="Cargando agenda…" />
        </div>
      } @else {
        <!-- Zona Hero -->
        <app-hero-turnos />

        <!-- Zona Media: Timeline -->
        <app-timeline (onTurnoClick)="onTurnoClick($event)" />
      }
    </div>

    <!-- Modal de nuevo turno -->
    <app-turno-form-modal #modalTurno />
    <!-- Modal de detalle / gestión de turno -->
    <app-turno-detalle-modal #modalDetalle (onCambios)="recargar()" />
  `,
})
export class AgendaPageComponent implements OnInit {
  @ViewChild('modalTurno') modalTurno!: TurnoFormModalComponent;
  @ViewChild('modalDetalle') modalDetalle!: TurnoDetalleModalComponent;

  protected readonly turnosState = inject(TurnosStateService);

  ngOnInit(): void {
    void this.turnosState.cargarAgenda();
  }

  protected onTurnoClick(turno: Turno): void {
    this.modalDetalle.abrir(turno);
  }

  protected recargar(): void {
    void this.turnosState.cargarAgenda();
  }
}
