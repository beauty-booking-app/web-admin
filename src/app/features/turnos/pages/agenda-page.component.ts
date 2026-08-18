import { Component, ViewChild } from '@angular/core';
import { HeaderBarComponent } from '../components/header-bar/header-bar.component';
import { HeroTurnosComponent } from '../components/hero-turnos/hero-turnos.component';
import { TimelineComponent } from '../components/timeline/timeline.component';
import { MetricasComponent } from '../components/metricas/metricas.component';
import { TurnoFormModalComponent } from '../components/turno-form-modal/turno-form-modal.component';

@Component({
  selector: 'app-agenda-page',
  imports: [
    HeaderBarComponent,
    HeroTurnosComponent,
    TimelineComponent,
    MetricasComponent,
    TurnoFormModalComponent,
  ],
  template: `
    <app-header-bar (onNuevoTurno)="modalTurno.abrir()" />

    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Zona Hero -->
      <app-hero-turnos />

      <!-- Zona Media: Timeline -->
      <app-timeline (onTurnoClick)="onTurnoClick($event)" />

      <!-- Zona Inferior: Métricas -->
      <app-metricas />
    </div>

    <!-- Modal de nuevo turno -->
    <app-turno-form-modal #modalTurno />
  `,
})
export class AgendaPageComponent {
  @ViewChild('modalTurno') modalTurno!: TurnoFormModalComponent;

  protected onTurnoClick(_turno: unknown): void {
    // Placeholder: futura implementación de gestión de turno existente
  }


}
