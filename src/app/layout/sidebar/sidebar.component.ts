import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TurnosStateService } from '../../features/turnos/services/turnos-state.service';
import { RecordatorioService } from '../../features/turnos/services/recordatorio.service';
import { ServiciosService } from '../../features/servicios-catalogo/services/servicios.service';
import { AuthService } from '../../core/api/auth.service';
import { CurrencyArsPipe } from '../../shared/pipes/currency-ars.pipe';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CurrencyArsPipe],
  template: `
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm h-full">
      <!-- Brand -->
      <div class="p-4 border-b border-slate-100 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 font-bold text-lg">
          ✂
        </div>
        <div>
          <h1 class="font-bold text-slate-900 text-sm tracking-wide">VELVET &amp; GLOW</h1>
          <p class="text-[11px] text-slate-600 font-medium">Gestión Operativa</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Menú principal">
        <div class="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Principal</div>

        <a routerLink="/" routerLinkActive="active-nav" [routerLinkActiveOptions]="{ exact: true }"
           class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all"
           aria-label="Agenda del día">
          <div class="flex items-center gap-2.5">
            <span class="w-4 h-4 text-rose-600">📅</span>
            <span>Agenda del Día</span>
          </div>
          <span class="px-2 py-0.5 text-[10px] rounded-full bg-rose-200 text-rose-800 font-bold">
            {{ turnosState.turnos().length }}
          </span>
        </a>

        <a routerLink="/calendario" routerLinkActive="active-nav"
           class="nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
           aria-label="Calendario por semana y mes">
          <span class="w-4 h-4 text-slate-600">🗓️</span>
          <span>Calendario</span>
        </a>

        <a routerLink="/servicios" routerLinkActive="active-nav"
           class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
           aria-label="Servicios y precios">
          <div class="flex items-center gap-2.5">
            <span class="w-4 h-4 text-slate-600">✨</span>
            <span>Servicios y Precios</span>
          </div>
          <span class="text-[10px] text-slate-500 font-medium">{{ serviciosService.totalServicios() }} tipos</span>
        </a>

        <a routerLink="/recordatorios" routerLinkActive="active-nav"
           class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
           aria-label="Recordatorios por WhatsApp">
          <div class="flex items-center gap-2.5">
            <span class="w-4 h-4 text-slate-600">📱</span>
            <span>Recordatorios</span>
          </div>
          @if (cantidadPendientes() > 0) {
            <span class="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold" title="pend. por enviar">
              {{ cantidadPendientes() }} pend.
            </span>
          }
        </a>

        <a routerLink="/analytics" routerLinkActive="active-nav"
           class="nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
           aria-label="Dashboard de analytics">
          <span class="w-4 h-4 text-slate-600">📊</span>
          <span>Analytics</span>
        </a>

        <a routerLink="/configuracion" routerLinkActive="active-nav"
           class="nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
           aria-label="Horarios y ausencias">
          <span class="w-4 h-4 text-slate-600">🕐</span>
           <span>Horarios y Ausencias</span>
        </a>
      </nav>

      <!-- Zona inferior fija: facturación + estado del salón -->
      <div class="shrink-0 border-t border-slate-200">
        <!-- Facturación estimada hoy -->
        <div class="p-3 bg-emerald-50 flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Facturación Estimada Hoy</p>
            <p class="text-base font-bold text-emerald-700 mt-0.5 truncate">{{ turnosState.metricas().facturacion | currencyArs }}</p>
          </div>
          <div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0" aria-hidden="true">$</div>
        </div>

        <!-- Status footer -->
        <div class="p-3 bg-slate-50 text-xs">
        <div class="flex items-center justify-between text-slate-600 mb-1">
          <span class="font-medium">Estado del Salón:</span>
          <span class="text-emerald-700 font-bold flex items-center gap-1">
            ✅ Operativo
          </span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div class="bg-gradient-to-r from-rose-500 to-emerald-500 h-full" [style.width.%]="porcentajeOcupacion"></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-600 font-medium mt-1">
          <span>Ocupación hoy: {{ porcentajeOcupacion }}%</span>
          <span>{{ turnosState.metricas().totalTurnos }} turnos</span>
        </div>

        <div class="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
          <span class="font-semibold text-slate-700 truncate" title="{{ auth.usuario()?.name ?? '' }}">
            {{ auth.usuario()?.name ?? 'Administrador' }}
          </span>
          <button (click)="cerrarSesion()"
                  class="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition whitespace-nowrap min-h-[44px]"
                  aria-label="Cerrar sesión">
            Cerrar sesión
          </button>
        </div>
        </div>
      </div>
    </aside>
  `,
  styles: `
    .active-nav {
      background-color: rgb(255 241 242 / 0.8);
      color: rgb(190 18 60);
      border: 1px solid rgb(254 205 211 / 0.8);
    }
    .active-nav:hover {
      background-color: rgb(255 241 242);
    }
  `,
})
export class SidebarComponent {
  readonly turnosState = inject(TurnosStateService);
  readonly serviciosService = inject(ServiciosService);
  private readonly recordatorioService = inject(RecordatorioService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cantidadPendientes = computed(
    () => this.recordatorioService.turnosPendientes().length,
  );

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/login']);
  }

  get porcentajeOcupacion(): number {
    const metricas = this.turnosState.metricas();
    if (metricas.totalTurnos === 0) return 0;
    return Math.min(100, Math.round((metricas.totalTurnos / 14) * 100));
  }
}
