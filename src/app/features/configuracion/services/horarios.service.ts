import { Injectable, signal, computed } from '@angular/core';
import type { FranjaLaboral, DiaSemana } from '../../../core/models/franja-laboral.model';
import { FRANJAS_SEMILLA } from '../../../core/models/franja-laboral.model';

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private readonly _franjas = signal<FranjaLaboral[]>(FRANJAS_SEMILLA.map((f) => ({ ...f })));
  private readonly _guardado = signal(false);

  readonly franjas = this._franjas.asReadonly();
  readonly guardado = this._guardado.asReadonly();

  readonly diasActivos = computed(() =>
    this._franjas().filter((f) => f.activo).length,
  );

  readonly diasCerrados = computed(() =>
    this._franjas().filter((f) => !f.activo),
  );

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

  guardar(): void {
    this._guardado.set(true);
    setTimeout(() => this._guardado.set(false), 2500);
  }
}
