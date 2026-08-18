import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgendaPdfService } from './agenda-pdf.service';
import type { Turno } from '../../../core/models/turno.model';
import { SERVICIOS_SEMILLA } from '../../../core/models/servicio.model';

const saveMock = vi.fn();

vi.mock('jspdf', () => {
  class MockJsPDF {
    save = saveMock;
    setFillColor() { return this; }
    rect() { return this; }
    roundedRect() { return this; }
    setFont() { return this; }
    setFontSize() { return this; }
    setTextColor() { return this; }
    text() { return this; }
    line() { return this; }
    setDrawColor() { return this; }
    addPage() { return this; }
    internal = {
      pageSize: { getWidth: () => 210, getHeight: () => 297 },
    };
  }
  return { jsPDF: MockJsPDF };
});

describe('AgendaPdfService', () => {
  let servicio: AgendaPdfService;

  beforeEach(() => {
    saveMock.mockClear();
    servicio = new AgendaPdfService();
  });

  function crearTurnos(): Turno[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const d = (hora: number): Date => {
      const f = new Date(hoy);
      f.setHours(hora, 0, 0, 0);
      return f;
    };
    const colorGlobal = SERVICIOS_SEMILLA.find((s) => s.id === 'color-global')!;
    const unasSemi = SERVICIOS_SEMILLA.find((s) => s.id === 'unas-semi')!;
    return [
      {
        id: 't1',
        cliente: { nombre: 'Lucía Méndez', telefono: '+54 9 351 555-1001' },
        servicio: colorGlobal,
        profesional: 'Sofía',
        inicio: d(9),
        fin: d(10),
        estado: 'Confirmado',
        recordatorioEnviado: true,
      },
      {
        id: 't2',
        cliente: { nombre: 'Andrea Paez', telefono: '+54 9 351 555-1002' },
        servicio: unasSemi,
        profesional: 'Camila',
        inicio: d(9),
        fin: d(10),
        estado: 'Finalizado',
        recordatorioEnviado: true,
      },
    ];
  }

  it('guarda un PDF al exportar la agenda', () => {
    servicio.exportarDia(crearTurnos());
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock.mock.calls[0][0]).toMatch(/^agenda-\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it('no lanza error con agenda vacía', () => {
    expect(() => servicio.exportarDia([])).not.toThrow();
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});