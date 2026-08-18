import { Component, inject } from '@angular/core';
import { TurnosStateService } from '../../services/turnos-state.service';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';

@Component({
  selector: 'app-metricas',
  imports: [CurrencyArsPipe],
  template: `
    <section class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          📊 Resumen Operativo y Métricas Clave (Mes Actual)
        </h3>
        <span class="text-[11px] text-slate-500">Métricas secundarias del negocio</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Facturación -->
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-slate-500 font-medium">Facturación Estimada Hoy</p>
            <p class="text-base font-bold text-emerald-600 mt-0.5">{{ metricas().facturacion | currencyArs }}</p>
          </div>
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">$</div>
        </div>

        <!-- Servicio demandado -->
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-slate-500 font-medium">Servicio Más Demandado</p>
            <p class="text-xs font-bold text-slate-800 mt-0.5">{{ metricas().servicioMasDemandado }}</p>
          </div>
          <div class="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-sm">✨</div>
        </div>

        <!-- Asistencia -->
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-slate-500 font-medium">Asistencia Promedio</p>
            <p class="text-base font-bold text-rose-600 mt-0.5">{{ metricas().asistencia }}%</p>
          </div>
          <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-sm">✓</div>
        </div>

        <!-- Recordatorios -->
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-slate-500 font-medium">Recordatorios Confirmados</p>
            <p class="text-base font-bold text-purple-600 mt-0.5">{{ metricas().confirmados }} de {{ metricas().totalTurnos }}</p>
          </div>
          <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">💬</div>
        </div>
      </div>
    </section>
  `,
})
export class MetricasComponent {
  private readonly turnosState = inject(TurnosStateService);
  protected readonly metricas = this.turnosState.metricas;
}
