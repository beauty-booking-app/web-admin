import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import type { Turno } from '../../../core/models/turno.model';

type Profesional = string;

interface FilaTurno {
  hora: string;
  cliente: string;
  servicio: string;
  estado: string;
  precio: string;
  telefono: string;
}

interface ColumnaFila {
  texto: string;
  x: number;
  ancho: number;
  bold: boolean;
  color: [number, number, number];
}

const ROJO: [number, number, number] = [190, 24, 60];
const GRIS_TITULO: [number, number, number] = [51, 65, 85];
const GRIS_TEXTO: [number, number, number] = [100, 116, 139];
const NEGRO: [number, number, number] = [30, 41, 59];

@Injectable({ providedIn: 'root' })
export class AgendaPdfService {
  exportarDia(turnos: Turno[]): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margen = 18;
    const ancho = 210 - margen * 2;
    let y = 22;

    this.dibujarCabecera(doc, turnos, margen);
    y = 34;

    const agrupados = this.agruparPorProfesional(turnos);

    if (agrupados.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(...GRIS_TEXTO);
      doc.text('Sin turnos para el día.', margen, y);
    } else {
      for (const grupo of agrupados) {
        if (y > 220) {
          doc.addPage();
          y = 22;
        }
        y = this.dibujarSeccion(doc, grupo, margen, ancho, y);
        for (const turno of grupo.turnos) {
          const fila = this.aFila(turno);
          if (y > 250) {
            doc.addPage();
            y = 22;
          }
          y = this.dibujarFila(doc, fila, margen, ancho, y, grupo.numeroFila);
        }
      }
    }

    const nombre = `agenda-${this.fechaTurnos(turnos)}.pdf`;
    doc.save(nombre);
  }

  private dibujarCabecera(doc: jsPDF, turnos: Turno[], margen: number): void {
    doc.setFillColor(...ROJO);
    doc.rect(0, 0, 210, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...NEGRO);
    doc.text('Tammi', margen, 16);

    const fecha = turnos.length > 0 ? this.fechaCompleta(turnos[0].inicio) : this.fechaCompleta(new Date());
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...GRIS_TEXTO);
    doc.text(`Agenda del día — ${fecha}`, margen, 24);

    doc.setDrawColor(190, 24, 60);
    doc.line(margen, 29, 210 - margen, 29);
  }

  private dibujarSeccion(
    doc: jsPDF,
    grupo: { profesional: Profesional; turnos: Turno[]; numeroFila: number },
    margen: number,
    ancho: number,
    y: number,
  ): number {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margen, y - 4, ancho, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...GRIS_TITULO);
    doc.text(`Profesional: ${grupo.profesional} (${grupo.turnos.length} turnos)`, margen + 4, y + 1);
    return y + 12;
  }

  private dibujarFila(
    doc: jsPDF,
    fila: FilaTurno,
    margen: number,
    ancho: number,
    y: number,
    numeroFila: number,
  ): number {
    const alturaFila = 10;
    const columna = [
      { texto: fila.hora, x: margen, ancho: 20, bold: true, color: NEGRO },
      { texto: fila.cliente, x: margen + 22, ancho: 45, bold: true, color: NEGRO },
      { texto: fila.servicio, x: margen + 69, ancho: 55, bold: false, color: GRIS_TITULO },
      { texto: fila.estado, x: margen + 126, ancho: 26, bold: false, color: ROJO },
      { texto: fila.precio, x: margen + 154, ancho: 20, bold: false, color: NEGRO },
      { texto: fila.telefono, x: margen + 176, ancho: 30, bold: false, color: GRIS_TEXTO },
    ];

    if (numeroFila % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margen, y, ancho, alturaFila, 'F');
    }

    doc.setFontSize(9);
    for (const c of columna) {
      doc.setFont('helvetica', c.bold ? 'bold' : 'normal');
      doc.setTextColor(...c.color);
      doc.text(c.texto, c.x, y + 6.5, { maxWidth: c.ancho });
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margen, y + alturaFila, margen + ancho, y + alturaFila);
    return y + alturaFila + 1;
  }

  private agruparPorProfesional(turnos: Turno[]): { profesional: string; turnos: Turno[]; numeroFila: number }[] {
    const orden = ['Sofía', 'Camila'];
    const grupos = new Map<string, Turno[]>();
    let numeroFila = 1;
    const resultado: { profesional: string; turnos: Turno[]; numeroFila: number }[] = [];

    for (const turno of [...turnos].sort((a, b) => a.inicio.getTime() - b.inicio.getTime())) {
      const lista = grupos.get(turno.profesional) ?? [];
      lista.push(turno);
      grupos.set(turno.profesional, lista);
    }

    const nombres = [...grupos.keys()].sort(
      (a, b) => (orden.indexOf(a) - orden.indexOf(b)) || a.localeCompare(b, 'es'),
    );
    for (const nombre of nombres) {
      resultado.push({ profesional: nombre, turnos: grupos.get(nombre)!, numeroFila });
      numeroFila += grupos.get(nombre)!.length;
    }
    return resultado;
  }

  private aFila(turno: Turno): FilaTurno {
    const fmtHora = (d: Date): string =>
      new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return {
      hora: `${fmtHora(turno.inicio)} - ${fmtHora(turno.fin)}`,
      cliente: turno.cliente.nombre,
      servicio: `${turno.servicio.categoria} · ${turno.servicio.subtipo}`,
      estado: turno.estado,
      precio: `$${turno.servicio.precioBase.toLocaleString('es-AR')}`,
      telefono: turno.cliente.telefono,
    };
  }

  private fechaTurnos(turnos: Turno[]): string {
    const fecha = turnos.length > 0 ? new Date(turnos[0].inicio) : new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  private fechaCompleta(fecha: Date): string {
    return fecha.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}