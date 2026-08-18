import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Servicio, CategoriaServicio } from '../../../core/models/servicio.model';
import { API_URL } from '../../../core/api/environment';
import type { Service } from '../../../core/api/backend.models';
import { serviceToServicios } from '../../../core/api/mappers';
import { mensajeDeError } from '../../../core/api/error-utils';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly http = inject(HttpClient);

  private readonly _servicios = signal<Servicio[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);
  private cargado = false;

  readonly servicios = this._servicios.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  readonly categorias = computed(() => {
    const orden: CategoriaServicio[] = [
      'CORTE UNISEX',
      'TRATAMIENTOS CAPILARES',
      'COLOR',
      'UÑAS',
    ];
    return orden.map((cat) => ({
      categoria: cat,
      servicios: this._servicios().filter((s) => s.categoria === cat),
    }));
  });

  readonly totalServicios = computed(() => this._servicios().length);

  async cargarServiciosSiNecesario(): Promise<void> {
    if (this.cargado || this._cargando()) return;
    await this.cargarServicios();
  }

  async cargarServicios(): Promise<void> {
    if (this._cargando()) return;
    this._cargando.set(true);
    this._error.set(null);
    try {
      const services = await firstValueFrom(
        this.http.get<Service[]>(`${API_URL}/public/services`),
      );
      this._servicios.set(services.flatMap(serviceToServicios));
      this.cargado = true;
    } catch (err) {
      this._error.set(mensajeDeError(err));
    } finally {
      this._cargando.set(false);
    }
  }

  catalogoPorSubtipo(): Map<string, Servicio> {
    const mapa = new Map<string, Servicio>();
    for (const servicio of this._servicios()) {
      mapa.set(servicio.subtipo, servicio);
    }
    return mapa;
  }

  agregar(servicio: OmitId<Servicio>): void {
    const id = `srv-${Date.now()}`;
    this._servicios.update((lista) => [...lista, { ...servicio, id }]);
  }

  editar(id: string, cambios: Partial<Pick<Servicio, 'subtipo' | 'duracionMinutos' | 'precioBase'>>): void {
    this._servicios.update((lista) =>
      lista.map((s) => (s.id === id ? { ...s, ...cambios } : s)),
    );
  }
}

type OmitId<T> = Omit<T, 'id'>;
