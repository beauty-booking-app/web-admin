import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TurnosStateService } from '../../services/turnos-state.service';
import { SERVICIOS_SEMILLA, type CategoriaServicio } from '../../../../core/models/servicio.model';
import type { Turno } from '../../../../core/models/turno.model';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';

interface GrupoServicios {
  categoria: CategoriaServicio;
  servicios: typeof SERVICIOS_SEMILLA;
}

@Component({
  selector: 'app-turno-form-modal',
  imports: [FormsModule, CurrencyArsPipe],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
           (click)="cerrar()"
           role="dialog"
           aria-modal="true"
           aria-label="Agendar nuevo turno">
        <div class="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
             (click)="$event.stopPropagation()">

          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              📅 Agendar Nuevo Turno
            </h3>
            <button (click)="cerrar()"
                    class="text-slate-400 hover:text-slate-600 transition p-1"
                    aria-label="Cerrar modal">
              ✕
            </button>
          </div>

          <form (ngSubmit)="guardar()" class="p-5 space-y-4 text-xs">
            <div>
              <label class="block text-slate-700 font-medium mb-1" for="cliente-nombre">Nombre y Apellido del Cliente</label>
              <input id="cliente-nombre" type="text" required
                     [(ngModel)]="nombreCliente" name="nombre"
                     placeholder="Ej: Marcela López"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-700 font-medium mb-1" for="cliente-telefono">Teléfono / WhatsApp</label>
                <input id="cliente-telefono" type="tel" required
                       [(ngModel)]="telefonoCliente" name="telefono"
                       placeholder="+54 9 351 ..."
                       class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
              </div>
              <div>
                <label class="block text-slate-700 font-medium mb-1" for="profesional-select">Profesional Asignado</label>
                <select id="profesional-select"
                        [(ngModel)]="profesionalSeleccionado" name="profesional"
                        class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
                  <option value="Sofía">Sofía (Peluquería Integral)</option>
                  <option value="Camila">Camila (Manicura y Uñas)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-slate-700 font-medium mb-1" for="servicio-select">Categoría y Servicio</label>
              <select id="servicio-select"
                      [(ngModel)]="servicioSeleccionado" name="servicio"
                      class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
                @for (grupo of gruposServicios; track grupo.categoria) {
                  <optgroup [label]="grupo.categoria">
                    @for (srv of grupo.servicios; track srv.id) {
                      <option [value]="srv.id">{{ srv.subtipo }} — {{ srv.precioBase | currencyArs }} — {{ srv.duracionMinutos }}m</option>
                    }
                  </optgroup>
                }
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-700 font-medium mb-1" for="hora-inicio">Horario Inicio</label>
                <input id="hora-inicio" type="time"
                       [(ngModel)]="horaInicio" name="horaInicio"
                       class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
              </div>
              <div>
                <label class="block text-slate-700 font-medium mb-1" for="estado-inicial">Estado Inicial</label>
                <select id="estado-inicial"
                        [(ngModel)]="estadoInicial" name="estado"
                        class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
                  <option value="Confirmado">Confirmado</option>
                  <option value="Pendiente">Pendiente de recordatorio</option>
                </select>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" (click)="cerrar()"
                      class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition">
                Cancelar
              </button>
              <button type="submit"
                      class="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-5 py-2 rounded-lg shadow-md shadow-rose-200 transition">
                Confirmar Agendamiento
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class TurnoFormModalComponent {
  private readonly turnosState = inject(TurnosStateService);

  readonly visible = signal(false);
  readonly onTurnoCreado = output<void>();

  protected nombreCliente = '';
  protected telefonoCliente = '';
  protected profesionalSeleccionado = 'Sofía';
  protected servicioSeleccionado = 'corte-dama';
  protected horaInicio = '11:00';
  protected estadoInicial = 'Confirmado';

  protected readonly gruposServicios: GrupoServicios[] = this.agruparServicios();

  abrir(horaPre?: string, profesionalPre?: string): void {
    if (horaPre) this.horaInicio = horaPre;
    if (profesionalPre) this.profesionalSeleccionado = profesionalPre;
    this.visible.set(true);
  }

  cerrar(): void {
    this.visible.set(false);
    this.resetForm();
  }

  guardar(): void {
    const servicio = SERVICIOS_SEMILLA.find((s) => s.id === this.servicioSeleccionado);
    if (!servicio || !this.nombreCliente.trim()) return;

    const [h, m] = this.horaInicio.split(':').map(Number);
    const hoy = new Date();
    hoy.setHours(h, m, 0, 0);

    const turno: Turno = {
      id: `turno-${Date.now()}`,
      cliente: { nombre: this.nombreCliente.trim(), telefono: this.telefonoCliente.trim() },
      servicio,
      profesional: this.profesionalSeleccionado,
      inicio: hoy,
      fin: new Date(hoy.getTime() + servicio.duracionMinutos * 60 * 1000),
      estado: this.estadoInicial as Turno['estado'],
      recordatorioEnviado: false,
    };

    this.turnosState.agregarTurno(turno);
    this.onTurnoCreado.emit();
    this.cerrar();
  }

  private resetForm(): void {
    this.nombreCliente = '';
    this.telefonoCliente = '';
    this.profesionalSeleccionado = 'Sofía';
    this.servicioSeleccionado = 'corte-dama';
    this.horaInicio = '11:00';
    this.estadoInicial = 'Confirmado';
  }

  private agruparServicios(): GrupoServicios[] {
    const categorias: CategoriaServicio[] = [
      'CORTE UNISEX',
      'TRATAMIENTOS CAPILARES',
      'COLOR',
      'UÑAS',
    ];
    return categorias.map((cat) => ({
      categoria: cat,
      servicios: SERVICIOS_SEMILLA.filter((s) => s.categoria === cat),
    }));
  }
}
