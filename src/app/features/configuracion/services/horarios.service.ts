import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { FranjaLaboral, DiaSemana } from '../../../core/models/franja-laboral.model';
import { API_URL } from '../../../core/api/environment';
import type { BusinessHour } from '../../../core/api/backend.models';
import { businessHourToFranja, franjaToBusinessHour } from '../../../core/api/mappers';
import { mensajeDeError } from '../../../core/api/error-utils';

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private readonly http = inject(HttpClient);

  private readonly _franjas = signal<FranjaLaboral[]>([]);
  private readonly _guardado = signal(false);
  private readonly _cargando = signal(false);
  private readonly _guardando = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly franjas = this._franjas.asReadonly();
  readonly guardado = this._guardado.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly guardando = this._guardando.asReadonly();
  readonly error = this._error.asReadonly();

  readonly diasActivos = computed(() =>
    this._franjas().filter((f) => f.activo).length,
  );

  readonly diasCerrados = computed(() =>
    this._franjas().filter((f) => !f.activo),
  );

  async cargarFranjas(): Promise<void> {
    if (this._cargando()) return;
    this._cargando.set(true);
    this._error.set(null);
    try {
      const horas = await firstValueFrom(
        this.http.get<BusinessHour[]>(`${API_URL}/admin/settings/business-hours`),
      );
      const franjas = horas
        .slice()
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map(businessHourToFranja);
      this._franjas.set(franjas);
    } catch (err) {
      this._error.set(mensajeDeError(err));
    } finally {
      this._cargando.set(false);
    }
  }

  async guardar(): Promise<void> {
    this._guardado.set(false);
    this._guardando.set(true);
    const body = this._franjas().map(franjaToBusinessHour);
    try {
      await firstValueFrom(this.http.patch(`${API_URL}/admin/settings/business-hours`, body));
      this._guardado.set(true);
      setTimeout(() => this._guardado.set(false), 2500);
    } catch (err) {
      this._error.set(mensajeDeError(err));
    } finally {
      this._guardando.set(false);
    }
  }

  toggleDia(dia: DiaSemana): void {
    this._franjas.update((lista) =>
      lista.map((f) => (f.dia === dia ? { ...f, activo: !f.activo } : f)),
    );
  }

  actualizarHora(dia: DiaSemana, campo: 'horaInicio' | 'horaFin', valor: string): void {
    this._franjas.update((lista) =>
      lista.map((f) => (f.dia === dia ? { ...f, [campo]: valor } : f)),
    );
  }
}
