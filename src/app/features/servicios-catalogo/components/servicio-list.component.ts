import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  hugeClipboard,
  hugeColors,
  hugeEdit02,
  hugeHairDryer,
  hugeScissor,
} from '@ng-icons/huge-icons';
import { mynaHand } from '@ng-icons/mynaui/outline';
import { ServiciosService } from '../services/servicios.service';
import { ServicioFormModalComponent } from './servicio-form-modal.component';
import { CategoriaFormModalComponent } from './categoria-form-modal.component';
import { CurrencyArsPipe } from '../../../shared/pipes/currency-ars.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import type { Servicio } from '../../../core/models/servicio.model';

const ICONOS_CATEGORIA: Record<string, string> = {
  'CORTE UNISEX': 'hugeScissor',
  'TRATAMIENTOS CAPILARES': 'hugeHairDryer',
  'COLOR': 'hugeColors',
  'UÑAS': 'mynaHand',
};

@Component({
  selector: 'app-servicio-list',
  imports: [CurrencyArsPipe, ServicioFormModalComponent, CategoriaFormModalComponent, LoadingComponent, NgIcon],
  providers: [provideIcons({ hugeClipboard, hugeColors, hugeEdit02, hugeHairDryer, hugeScissor, mynaHand })],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Servicios y Precios</h2>
          <p class="text-xs text-slate-600 mt-1">{{ serviciosService.totalServicios() }} servicios en {{ categorias().length }} categorías</p>
        </div>
        <button (click)="modalCategoria.abrir()"
                class="cursor-pointer bg-rose-700 hover:bg-rose-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-md shadow-rose-200 transition flex items-center gap-2"
                aria-label="Crear nueva categoría">
          <span class="text-base leading-none">+</span>
          Nueva Categoría
        </button>
      </div>

      @if (serviciosService.error(); as err) {
        <div role="alert"
             class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 font-medium">
          Error al cargar los servicios: {{ err }}
        </div>
      }

      @if (serviciosService.cargando()) {
        <div class="bg-white border border-slate-200 rounded-xl p-10 shadow-sm">
          <app-loading texto="Cargando servicios…" />
        </div>
      } @else if (serviciosService.totalServicios() === 0 && !serviciosService.error()) {
        <div class="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-600 shadow-sm">
          No hay servicios cargados.
        </div>
      } @else {
        <!-- Tarjetas de categoría -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        @for (grupo of categorias(); track grupo.categoria) {
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <!-- Header de categoría -->
            <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <ng-icon [name]="icono(grupo.categoria)" size="18" class="text-slate-700 shrink-0" />
                <h3 class="font-bold text-slate-900 text-xs tracking-wide">{{ grupo.categoria }}</h3>
              </div>
              <button (click)="modal.abrirNueva(grupo.categoria)"
                      class="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-semibold transition"
                      [attr.aria-label]="'Agregar servicio a ' + grupo.categoria">
                <span class="text-sm leading-none">+</span>
                Agregar
              </button>
            </div>

            <!-- Lista de servicios -->
            <div class="divide-y divide-slate-100">
              @for (srv of grupo.servicios; track srv.id) {
                <div class="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition group">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-900 truncate">{{ srv.subtipo }}</p>
                    <p class="text-[11px] text-slate-600 mt-0.5">{{ srv.duracionMinutos }} min</p>
                  </div>
                  <div class="flex items-center gap-3 ml-4">
                    <span class="text-xs font-bold text-slate-900 whitespace-nowrap">
                      {{ srv.precioBase | currencyArs }}
                    </span>
                    <button (click)="modal.abrirEdicion(srv)"
                            class="cursor-pointer opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-600 transition p-1"
                            [attr.aria-label]="'Editar ' + srv.subtipo">
                      <ng-icon name="hugeEdit02" size="14" />
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
      }
    </div>

    <app-servicio-form-modal #modalServicio />
    <app-categoria-form-modal #modalCategoria />
  `,
})
export class ServicioListComponent implements OnInit {
  readonly serviciosService = inject(ServiciosService);
  protected readonly categorias = this.serviciosService.categorias;

  @ViewChild('modalServicio') modal!: ServicioFormModalComponent;
  @ViewChild('modalCategoria') modalCategoria!: CategoriaFormModalComponent;

  ngOnInit(): void {
    void this.serviciosService.cargarServicios();
  }

  protected icono(categoria: string): string {
    return ICONOS_CATEGORIA[categoria] ?? 'hugeClipboard';
  }
}
