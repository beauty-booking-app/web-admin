import { Component, inject, ViewChild } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';
import { ServicioFormModalComponent } from './servicio-form-modal.component';
import { CurrencyArsPipe } from '../../../shared/pipes/currency-ars.pipe';
import type { Servicio, CategoriaServicio } from '../../../core/models/servicio.model';

const ICONOS_CATEGORIA: Record<CategoriaServicio, string> = {
  'CORTE UNISEX': '✂️',
  'TRATAMIENTOS CAPILARES': '💆',
  'COLOR': '🎨',
  'UÑAS': '💅',
};

@Component({
  selector: 'app-servicio-list',
  imports: [CurrencyArsPipe, ServicioFormModalComponent],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Servicios y Precios</h2>
          <p class="text-xs text-slate-500 mt-1">{{ serviciosService.totalServicios() }} servicios en {{ categorias().length }} categorías</p>
        </div>
        <button (click)="modal.abrirNueva()"
                class="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-md shadow-rose-200 transition flex items-center gap-2"
                aria-label="Crear nuevo servicio">
          <span class="text-base leading-none">+</span>
          Nuevo Servicio
        </button>
      </div>

      <!-- Tarjetas de categoría -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        @for (grupo of categorias(); track grupo.categoria) {
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <!-- Header de categoría -->
            <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="text-base">{{ icono(grupo.categoria) }}</span>
                <h3 class="font-bold text-slate-900 text-xs tracking-wide">{{ grupo.categoria }}</h3>
              </div>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700">
                {{ grupo.servicios.length }}
              </span>
            </div>

            <!-- Lista de servicios -->
            <div class="divide-y divide-slate-100">
              @for (srv of grupo.servicios; track srv.id) {
                <div class="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition group">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-900 truncate">{{ srv.subtipo }}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">{{ srv.duracionMinutos }} min</p>
                  </div>
                  <div class="flex items-center gap-3 ml-4">
                    <span class="text-xs font-bold text-slate-900 whitespace-nowrap">
                      {{ srv.precioBase | currencyArs }}
                    </span>
                    <button (click)="modal.abrirEdicion(srv)"
                            class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
                            [attr.aria-label]="'Editar ' + srv.subtipo">
                      ✏️
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Footer con acción -->
            <div class="px-5 py-2.5 bg-slate-50/50 border-t border-slate-100">
              <button (click)="modal.abrirNueva(grupo.categoria)"
                      class="text-[11px] font-medium text-rose-600 hover:text-rose-700 transition"
                      [attr.aria-label]="'Agregar servicio a ' + grupo.categoria">
                + Agregar a {{ grupo.categoria }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <app-servicio-form-modal #modalServicio />
  `,
})
export class ServicioListComponent {
  readonly serviciosService = inject(ServiciosService);
  protected readonly categorias = this.serviciosService.categorias;

  @ViewChild('modalServicio') modal!: ServicioFormModalComponent;

  protected icono(categoria: CategoriaServicio): string {
    return ICONOS_CATEGORIA[categoria] ?? '📋';
  }
}
