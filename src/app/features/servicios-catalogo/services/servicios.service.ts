import { Injectable, signal, computed } from '@angular/core';
import type { Servicio, CategoriaServicio } from '../../../core/models/servicio.model';
import { SERVICIOS_SEMILLA } from '../../../core/models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly _servicios = signal<Servicio[]>([...SERVICIOS_SEMILLA]);

  readonly servicios = this._servicios.asReadonly();

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
