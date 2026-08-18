import { Component, computed, inject, OnInit } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';
import { CurrencyArsPipe } from '../../../shared/pipes/currency-ars.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-analytics-page',
  imports: [CurrencyArsPipe, LoadingComponent],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Dashboard de Analytics</h2>
          <p class="text-xs text-slate-500 mt-1">
            Evolución del negocio: demanda, facturación y clientes.
          </p>
        </div>

        <!-- Filtros -->
        <div class="flex items-center gap-3">
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1" for="filtro-mes">Mes</label>
            <select id="filtro-mes"
                    [value]="analyticsService.mesSeleccionado()"
                    (change)="onMesChange($event)"
                    class="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none min-h-[44px]">
              @for (mes of analyticsService.meses(); track mes.key) {
                <option [value]="mes.key">{{ mes.label }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1" for="filtro-categoria">Categoría</label>
            <select id="filtro-categoria"
                    [value]="analyticsService.categoriaSeleccionada()"
                    (change)="onCategoriaChange($event)"
                    class="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none min-h-[44px]">
              <option value="TODAS">Todas</option>
              @for (categoria of analyticsService.categorias; track categoria) {
                <option [value]="categoria">{{ categoria }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      @if (analyticsService.error(); as err) {
        <div role="alert"
             class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 font-medium">
          Error al cargar los datos de analytics: {{ err }}
        </div>
      }

      @if (analyticsService.cargando()) {
        <div class="bg-white border border-slate-200 rounded-xl p-10 shadow-sm">
          <app-loading texto="Cargando datos de analytics…" />
        </div>
      } @else {

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[11px] text-slate-500 font-medium">Turnos Totales (mes)</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ kpis().totalTurnos }}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[11px] text-slate-500 font-medium">Clientes Únicos (mes)</p>
          <p class="text-2xl font-bold text-slate-900 mt-1">{{ kpis().clientesUnicos }}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[11px] text-slate-500 font-medium">Facturación (mes)</p>
          <p class="text-2xl font-bold text-emerald-600 mt-1">{{ kpis().facturacion | currencyArs }}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p class="text-[11px] text-slate-500 font-medium">Ticket Promedio</p>
          <p class="text-2xl font-bold text-rose-600 mt-1">{{ kpis().ticketPromedio | currencyArs }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Turnos por mes -->
        <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Turnos por Mes</h3>
          <p class="text-[11px] text-slate-500 mt-0.5">Últimos 6 meses</p>
          <div class="mt-5 flex items-end justify-between gap-3 h-44"
               role="img"
               [attr.aria-label]="descripcionTurnosPorMes()">
            @for (mes of analyticsService.turnosPorMes(); track mes.key) {
              <div class="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span class="text-[10px] font-semibold text-slate-700">{{ mes.cantidad }}</span>
                <div class="w-full bg-rose-100 rounded-t-md transition-all"
                     [style.height.%]="alturaBarra(mes.cantidad, maxTurnos)"
                     title="{{ mes.label }}: {{ mes.cantidad }} turnos"></div>
                <span class="text-[10px] text-slate-500 truncate w-full text-center">{{ siglaMes(mes.label) }}</span>
              </div>
            }
          </div>
        </section>

        <!-- Ganancias por mes -->
        <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Ganancias por Mes</h3>
          <p class="text-[11px] text-slate-500 mt-0.5">Facturación y diferencia vs mes anterior</p>
          <div class="mt-5 space-y-3 overflow-y-auto max-h-44"
               role="img"
               [attr.aria-label]="descripcionGanancias()">
            @for (mes of analyticsService.gananciasPorMes(); track mes.key) {
              <div class="flex items-center gap-3">
                <span class="w-20 shrink-0 text-[11px] font-medium text-slate-600">{{ siglaMes(mes.label) }}</span>
                <div class="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div class="bg-emerald-500 h-full rounded-full transition-all"
                       [style.width.%]="alturaBarra(mes.facturacion, maxGanancias)"
                       title="{{ mes.label }}: {{ mes.facturacion | currencyArs }}"></div>
                </div>
                <span class="w-24 shrink-0 text-right text-[11px] font-semibold text-slate-800">
                  {{ mes.facturacion | currencyArs }}
                </span>
                <span class="w-16 shrink-0 text-right text-[11px] font-bold"
                      [class.text-emerald-600]="mes.diferenciaPct >= 0"
                      [class.text-rose-600]="mes.diferenciaPct < 0">
                  {{ mes.diferenciaPct >= 0 ? '+' : '' }}{{ mes.diferenciaPct }}%
                </span>
              </div>
            }
          </div>
        </section>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Servicios más solicitados -->
        <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Servicios Más Solicitados</h3>
          <p class="text-[11px] text-slate-500 mt-0.5">Top 5 del mes seleccionado</p>
          <div class="mt-5 space-y-3">
            @for (servicio of analyticsService.serviciosTop(); track servicio.subtipo) {
              <div class="flex items-center gap-3">
                <span class="w-28 shrink-0 text-[11px] font-medium text-slate-600 truncate">{{ servicio.subtipo }}</span>
                <div class="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div class="bg-rose-500 h-full rounded-full transition-all"
                       [style.width.%]="alturaBarra(servicio.cantidad, maxServicios)" [title]="servicio.subtipo"></div>
                </div>
                <span class="w-16 shrink-0 text-right text-[11px] font-semibold text-slate-800">{{ servicio.cantidad }}</span>
                <span class="w-24 shrink-0 text-right text-[11px] text-slate-500">{{ servicio.recaudacion | currencyArs }}</span>
              </div>
            }
            @empty {
              <p class="text-sm text-slate-500 text-center py-6">Sin datos para esta categoría.</p>
            }
          </div>
        </section>

        <!-- Clientes frecuentes -->
        <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Clientes Frecuentes</h3>
          <p class="text-[11px] text-slate-500 mt-0.5">Top 5 por cantidad de turnos del mes</p>
          <ul class="mt-5 divide-y divide-slate-100">
            @for (cliente of analyticsService.clientesFrecuentes(); track cliente.nombre; let i = $index) {
              <li class="flex items-center gap-3 py-2.5">
                <span class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                  {{ i + 1 }}
                </span>
                <span class="flex-1 text-sm font-medium text-slate-800">{{ cliente.nombre }}</span>
                <span class="text-xs font-bold text-slate-700">{{ cliente.cantidad }} turnos</span>
              </li>
            }
            @empty {
              <li class="text-sm text-slate-500 text-center py-6">Sin clientes en el mes seleccionado.</li>
            }
          </ul>
        </section>
      </div>
      }
    </div>
  `,
})
export class AnalyticsPageComponent implements OnInit {
  protected readonly analyticsService = inject(AnalyticsService);

  protected readonly kpis = this.analyticsService.kpis;

  ngOnInit(): void {
    void this.analyticsService.cargarHistorico();
  }

  protected readonly descripcionTurnosPorMes = computed(() =>
    this.analyticsService.turnosPorMes()
      .map((m) => `${m.label}: ${m.cantidad} turnos`)
      .join(', '),
  );

  protected readonly descripcionGanancias = computed(() =>
    this.analyticsService.gananciasPorMes()
      .map((m) => `${m.label}: ${m.facturacion}, diferencia ${m.diferenciaPct}%`)
      .join(', '),
  );

  protected alturaBarra(valor: number, maximo: number): number {
    if (maximo === 0) return 0;
    return Math.max(8, Math.round((valor / maximo) * 100));
  }

  protected get maxTurnos(): number {
    return Math.max(...this.analyticsService.turnosPorMes().map((m) => m.cantidad), 1);
  }

  protected get maxGanancias(): number {
    return Math.max(...this.analyticsService.turnosPorMes().map((m) => m.facturacion), 1);
  }

  protected get maxServicios(): number {
    return Math.max(...this.analyticsService.serviciosTop().map((s) => s.cantidad), 1);
  }

  protected siglaMes(label: string): string {
    return label.charAt(0).toUpperCase() + label.split(' ')[0].slice(1, 3);
  }

  protected onMesChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.analyticsService.setMesSeleccionado(select.value);
  }

  protected onCategoriaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.analyticsService.setCategoriaSeleccionada(select.value as never);
  }
}