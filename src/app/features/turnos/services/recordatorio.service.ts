import { Injectable, computed, inject, signal } from '@angular/core';
import { TurnosStateService } from './turnos-state.service';
import { construirMensajeRecordatorio, construirWhatsAppLink } from '../../../shared/utils/whatsapp-utils';
import type { Turno } from '../../../core/models/turno.model';

@Injectable({ providedIn: 'root' })
export class RecordatorioService {
  private readonly turnosState = inject(TurnosStateService);

  readonly turnosPendientes = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.turnosState.turnos().filter((t) => {
      const inicio = new Date(t.inicio);
      inicio.setHours(0, 0, 0, 0);
      return t.estado === 'Pendiente' && !t.recordatorioEnviado && inicio.getTime() === hoy.getTime();
    });
  });

  readonly enviados = signal<string[]>([]);

  enviarIndividual(turno: Turno): void {
    if (!turno.cliente.telefono) return;
    this.abrirWhatsApp(turno);
    this.turnosState.marcarRecordatorio(turno.id);
    this.registrarEnviado(turno.id);
  }

  enviarTodos(): void {
    for (const turno of this.turnosPendientes()) {
      if (!turno.cliente.telefono) continue;
      this.abrirWhatsApp(turno);
      this.turnosState.marcarRecordatorio(turno.id);
      this.registrarEnviado(turno.id);
    }
  }

  private abrirWhatsApp(turno: Turno): void {
    const link = construirWhatsAppLink(turno.cliente.telefono, construirMensajeRecordatorio(turno));
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  private registrarEnviado(turnoId: string): void {
    this.enviados.update((ids) => (ids.includes(turnoId) ? ids : [...ids, turnoId]));
  }
}