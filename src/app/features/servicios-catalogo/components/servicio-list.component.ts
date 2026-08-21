import { Component, inject, ViewChild, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  hugeClipboard,
  hugeColors,
  hugeDelete02,
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

const ICONOS_CATEGORIA: Record<string, string> = {
  'CORTE UNISEX': 'hugeScissor',
  'TRATAMIENTOS CAPILARES': 'hugeHairDryer',
  'COLOR': 'hugeColors',
  'UÑAS': 'mynaHand',
};

@Component({
  selector: 'app-servicio-list',
  imports: [CurrencyArsPipe, ServicioFormModalComponent, CategoriaFormModalComponent, LoadingComponent, NgIcon],
  providers: [provideIcons({ hugeClipboard, hugeColors, hugeDelete02, hugeEdit02, hugeHairDryer, hugeScissor, mynaHand })],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Servicios y Precios</h2>
          <p class="text-xs text-slate-600 mt-1">{{ serviciosService.totalServicios() }} servicios en {{ serviciosService.categorias().length }} categorías</p>
        </div>
        <button (click)="modalCategoria.abrir()"
                class="cursor-pointer bg-rose-500 hover:bg-rose-700 text-sm text-white font-semibold px-4 py-2 rounded-lg shadow-md shadow-rose-200 transition flex items-center gap-2"
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
        @for (grupo of serviciosService.categorias(); track grupo.id) {
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <!-- Header de categoría -->
            <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2.5 min-w-0">
                @if (grupo.imagenUrl) {
                  <img [src]="grupo.imagenUrl"
                       [alt]="'Imagen de ' + grupo.categoria"
                       class="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0">
                } @else {
                  <ng-icon [name]="icono(grupo.categoria)" size="18" class="text-slate-700 shrink-0" />
                }
                <h3 class="font-bold text-slate-900 text-xs tracking-wide truncate">{{ grupo.categoria }}</h3>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button (click)="modalCategoria.abrirEdicion(grupo)"
                        class="cursor-pointer p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition"
                        [attr.aria-label]="'Editar categoría ' + grupo.categoria">
                  <ng-icon name="hugeEdit02" size="14" />
                </button>
                @if (categoriaAEliminar() === grupo.id) {
                  <button (click)="confirmarEliminarCategoria(grupo.id)"
                          class="cursor-pointer px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition"
                          aria-label="Confirmar eliminación de la categoría">
                    ¿Eliminar?
                  </button>
                } @else {
                  <button (click)="categoriaAEliminar.set(grupo.id)"
                          class="cursor-pointer p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white transition"
                          [attr.aria-label]="'Eliminar categoría ' + grupo.categoria">
                    <ng-icon name="hugeDelete02" size="14" />
                  </button>
                }
                <button (click)="modal.abrirNueva(grupo.categoria)"
                        class="cursor-pointer flex items-center gap-1 px-3 py-1.5 ml-1 rounded-lg bg-rose-500 hover:bg-rose-700 text-white text-[11px] font-semibold transition"
                        [attr.aria-label]="'Agregar servicio a ' + grupo.categoria">
                  <span class="text-sm leading-none">+</span>
                  Agregar
                </button>
              </div>
            </div>

            @if (errorEliminacion(); as msg) {
              <p role="alert" class="px-5 py-2 bg-red-50 border-b border-red-100 text-[11px] text-red-700 font-medium">{{ msg }}</p>
            }

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
                            class="cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-500 hover:text-rose-600 transition p-1"
                            [attr.aria-label]="'Editar ' + srv.subtipo">
                      <ng-icon name="hugeEdit02" size="14" />
                    </button>
                    @if (tipoAEliminar() === srv.id) {
                      <button (click)="confirmarEliminarTipo(srv.id)"
                              class="cursor-pointer px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold transition"
                              [attr.aria-label]="'Confirmar eliminación de ' + srv.subtipo">
                        ¿Eliminar?
                      </button>
                    } @else {
                      <button (click)="tipoAEliminar.set(srv.id)"
                              class="cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-500 hover:text-red-600 transition p-1"
                              [attr.aria-label]="'Eliminar ' + srv.subtipo">
                        <ng-icon name="hugeDelete02" size="14" />
                      </button>
                    }
                  </div>
                </div>
              } @empty {
                <div class="px-5 py-6 text-center text-[11px] text-slate-500">
                  Categoría sin servicios. Usá "Agregar" para crear el primero.
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

  protected readonly categoriaAEliminar = signal<string | null>(null);
  protected readonly tipoAEliminar = signal<string | null>(null);
  protected readonly errorEliminacion = signal<string | null>(null);

  @ViewChild('modalServicio') modal!: ServicioFormModalComponent;
  @ViewChild('modalCategoria') modalCategoria!: CategoriaFormModalComponent;

  ngOnInit(): void {
    void this.serviciosService.cargarServicios();
  }

  protected icono(categoria: string): string {
    return ICONOS_CATEGORIA[categoria.trim().toUpperCase()] ?? 'hugeClipboard';
  }

  protected async confirmarEliminarCategoria(id: string): Promise<void> {
    try {
      await this.serviciosService.eliminarCategoria(id);
      this.errorEliminacion.set(null);
      await this.serviciosService.cargarServicios();
    } catch (err) {
      this.errorEliminacion.set(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      this.categoriaAEliminar.set(null);
    }
  }

  protected async confirmarEliminarTipo(id: string): Promise<void> {
    try {
      await this.serviciosService.eliminarTipo(id);
      this.errorEliminacion.set(null);
      await this.serviciosService.cargarServicios();
    } catch (err) {
      this.errorEliminacion.set(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      this.tipoAEliminar.set(null);
    }
  }
}
