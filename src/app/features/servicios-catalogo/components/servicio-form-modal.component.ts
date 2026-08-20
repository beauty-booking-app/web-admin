import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../services/servicios.service';
import type { Servicio, CategoriaServicio } from '../../../core/models/servicio.model';

@Component({
  selector: 'app-servicio-form-modal',
  imports: [FormsModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
           (click)="cerrar()"
           role="dialog"
           aria-modal="true"
           [attr.aria-label]="esEdicion() ? 'Editar servicio' : 'Nuevo servicio'">
        <div class="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
             (click)="$event.stopPropagation()">

          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              {{ esEdicion() ? '✏️ Editar Servicio' : '✨ Nuevo Servicio' }}
            </h3>
            <button (click)="cerrar()"
                    class="text-slate-500 hover:text-slate-600 transition p-1"
                    aria-label="Cerrar modal">
              ✕
            </button>
          </div>

          <form (ngSubmit)="guardar()" class="p-5 space-y-4 text-xs">
            <div>
              <label class="block text-slate-700 font-medium mb-1" for="srv-categoria">Categoría</label>
              <select id="srv-categoria"
                      [(ngModel)]="categoria" name="categoria"
                      [disabled]="esEdicion()"
                      class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition disabled:opacity-50">
                @for (cat of categorias; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-slate-700 font-medium mb-1" for="srv-subtipo">Nombre del Servicio</label>
              <input id="srv-subtipo" type="text" required
                     [(ngModel)]="subtipo" name="subtipo"
                     placeholder="Ej: Corte Dama"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-700 font-medium mb-1" for="srv-precio">Precio (ARS)</label>
                <input id="srv-precio" type="number" required min="0"
                       [(ngModel)]="precio" name="precio"
                       placeholder="12500"
                       class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
              </div>
              <div>
                <label class="block text-slate-700 font-medium mb-1" for="srv-duracion">Duración (min)</label>
                <input id="srv-duracion" type="number" required min="5" step="5"
                       [(ngModel)]="duracion" name="duracion"
                       placeholder="45"
                       class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" (click)="cerrar()"
                      class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition">
                Cancelar
              </button>
              <button type="submit"
                      class="bg-rose-700 hover:bg-rose-800 text-white font-semibold px-5 py-2 rounded-lg shadow-md shadow-rose-200 transition">
                {{ esEdicion() ? 'Guardar Cambios' : 'Crear Servicio' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ServicioFormModalComponent {
  private readonly serviciosService = inject(ServiciosService);

  readonly visible = signal(false);
  readonly onGuardado = output<void>();

  protected esEdicion = signal(false);
  protected servicioId = '';
  protected categoria: CategoriaServicio = 'CORTE UNISEX';
  protected subtipo = '';
  protected precio = 0;
  protected duracion = 45;

  protected readonly categorias: CategoriaServicio[] = [
    'CORTE UNISEX',
    'TRATAMIENTOS CAPILARES',
    'COLOR',
    'UÑAS',
  ];

  abrirNueva(categoria?: CategoriaServicio): void {
    this.esEdicion.set(false);
    this.servicioId = '';
    this.categoria = categoria ?? 'CORTE UNISEX';
    this.subtipo = '';
    this.precio = 0;
    this.duracion = 45;
    this.visible.set(true);
  }

  abrirEdicion(servicio: Servicio): void {
    this.esEdicion.set(true);
    this.servicioId = servicio.id;
    this.categoria = servicio.categoria;
    this.subtipo = servicio.subtipo;
    this.precio = servicio.precioBase;
    this.duracion = servicio.duracionMinutos;
    this.visible.set(true);
  }

  cerrar(): void {
    this.visible.set(false);
  }

  guardar(): void {
    if (!this.subtipo.trim() || this.precio <= 0 || this.duracion <= 0) return;

    if (this.esEdicion()) {
      this.serviciosService.editar(this.servicioId, {
        subtipo: this.subtipo.trim(),
        precioBase: this.precio,
        duracionMinutos: this.duracion,
      });
    } else {
      this.serviciosService.agregar({
        categoria: this.categoria,
        subtipo: this.subtipo.trim(),
        precioBase: this.precio,
        duracionMinutos: this.duracion,
      });
    }

    this.onGuardado.emit();
    this.cerrar();
  }
}
