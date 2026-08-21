import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { hugeCancel01, hugeFolder01 } from '@ng-icons/huge-icons';
import { ServiciosService } from '../services/servicios.service';

@Component({
  selector: 'app-categoria-form-modal',
  imports: [FormsModule, NgIcon],
  providers: [provideIcons({ hugeCancel01, hugeFolder01 })],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
           (click)="cerrar()" role="dialog" aria-modal="true" aria-label="Nueva categoría">
        <div class="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
             (click)="$event.stopPropagation()">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ng-icon name="hugeFolder01" size="16" class="shrink-0" /> Nueva Categoría
            </h3>
            <button (click)="cerrar()" class="cursor-pointer text-slate-500 hover:text-slate-600 transition p-1"
                    aria-label="Cerrar modal">
              <ng-icon name="hugeCancel01" size="14" />
            </button>
          </div>

          <form (ngSubmit)="guardar()" class="p-5 space-y-4 text-xs">
            <div>
              <label class="block text-slate-700 font-medium mb-1" for="cat-nombre">Nombre de la categoría</label>
              <input id="cat-nombre" type="text" required
                     [(ngModel)]="nombre" name="nombre" autofocus
                     placeholder="Ej: DEPILACIÓN"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition">
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" (click)="cerrar()"
                      class="cursor-pointer px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition">
                Cancelar
              </button>
              <button type="submit"
                      class="cursor-pointer bg-rose-700 hover:bg-rose-800 text-white font-semibold px-5 py-2 rounded-lg shadow-md shadow-rose-200 transition">
                Crear Categoría
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CategoriaFormModalComponent {
  private readonly serviciosService = inject(ServiciosService);

  readonly visible = signal(false);
  readonly onCreada = output<string>();

  protected nombre = '';

  abrir(): void {
    this.nombre = '';
    this.visible.set(true);
  }

  cerrar(): void {
    this.visible.set(false);
  }

  guardar(): void {
    const limpio = this.nombre.trim();
    if (!limpio) return;
    this.serviciosService.agregarCategoria(limpio);
    this.onCreada.emit(limpio);
    this.cerrar();
  }
}
