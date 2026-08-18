import { Injectable, computed, signal } from '@angular/core';
import { SERVICIOS_SEMILLA, type Servicio, type CategoriaServicio } from '../../../core/models/servicio.model';

interface MesAnalitico {
  key: string;
  label: string;
  cantidad: number;
  facturacion: number;
}

interface ServicioTop {
  subtipo: string;
  categoria: CategoriaServicio;
  cantidad: number;
  recaudacion: number;
}

interface ClienteFrecuente {
  nombre: string;
  cantidad: number;
}

interface TurnoHistorico {
  inicio: Date;
  estado: 'Confirmado' | 'Finalizado' | 'Cancelado' | 'Pendiente';
  servicio: Servicio;
  cliente: { nombre: string };
  profesional: string;
}

const CLIENTES_SEMILLA = [
  'Lucía Méndez',
  'Andrea Paez',
  'Mariana Gómez',
  'Sofía Rivas',
  'Valeria Fernández',
  'Carolina Rossi',
  'Camila Herrera',
  'Josefina López',
  'Martina Acosta',
  'Paula Giménez',
  'Renata Sosa',
  'Florencia Díaz',
];

const PROFESIONALES = ['Sofía', 'Camila'];

function crearSemilla(seed: number): () => number {
  let estado = seed >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly _turnos = signal<TurnoHistorico[]>([]);
  private readonly _mesSeleccionado = signal<string>('');
  private readonly _categoriaSeleccionada = signal<CategoriaServicio | 'TODAS'>('TODAS');

  readonly categorias: CategoriaServicio[] = [
    'CORTE UNISEX',
    'TRATAMIENTOS CAPILARES',
    'COLOR',
    'UÑAS',
  ];

  readonly meses = computed(() => {
    const ahora = new Date();
    const lista: { key: string; label: string }[] = [];
    for (let i = 6; i >= 1; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      lista.push({ key: this.mesKey(fecha), label: this.mesLabel(fecha) });
    }
    return lista;
  });

  readonly mesSeleccionado = this._mesSeleccionado.asReadonly();
  readonly categoriaSeleccionada = this._categoriaSeleccionada.asReadonly();

  constructor() {
    this._turnos.set(this.generarTurnos());
    this._mesSeleccionado.set(this.meses()[this.meses().length - 1].key);
  }

  readonly turnosPorMes = computed<MesAnalitico[]>(() => {
    const porMes = new Map<string, { cantidad: number; facturacion: number }>();
    for (const mes of this.meses()) {
      porMes.set(mes.key, { cantidad: 0, facturacion: 0 });
    }
    for (const turno of this._turnos()) {
      const key = this.mesKey(turno.inicio);
      const registro = porMes.get(key);
      if (registro) {
        registro.cantidad += 1;
        if (turno.estado === 'Finalizado' || turno.estado === 'Confirmado') {
          registro.facturacion += turno.servicio.precioBase;
        }
      }
    }
    return this.meses().map((mes) => ({
      key: mes.key,
      label: mes.label,
      cantidad: porMes.get(mes.key)?.cantidad ?? 0,
      facturacion: porMes.get(mes.key)?.facturacion ?? 0,
    }));
  });

  readonly gananciasPorMes = computed(() => {
    const base = this.turnosPorMes();
    return base.map((mes, index) => {
      const anterior = index > 0 ? base[index - 1].facturacion : 0;
      const diferencia = anterior > 0 ? ((mes.facturacion - anterior) / anterior) * 100 : 0;
      return { ...mes, diferenciaPct: Math.round(diferencia * 10) / 10 };
    });
  });

  readonly kpis = computed(() => {
    const turnos = this.turnosDelMesSeleccionado();
    const clientes = new Set(turnos.map((t) => t.cliente.nombre));
    const facturacion = turnos
      .filter((t) => t.estado === 'Finalizado' || t.estado === 'Confirmado')
      .reduce((sum, t) => sum + t.servicio.precioBase, 0);
    const ticket = turnos.length > 0 ? facturacion / turnos.length : 0;
    return {
      totalTurnos: turnos.length,
      clientesUnicos: clientes.size,
      facturacion,
      ticketPromedio: Math.round(ticket),
    };
  });

  readonly serviciosTop = computed<ServicioTop[]>(() => {
    const turnos = this.filtradosPorCategoria();
    const conteo = new Map<string, { cantidad: number; recaudacion: number }>();
    for (const turno of turnos) {
      const key = turno.servicio.subtipo;
      const registro = conteo.get(key) ?? { cantidad: 0, recaudacion: 0 };
      registro.cantidad += 1;
      registro.recaudacion += turno.servicio.precioBase;
      conteo.set(key, registro);
    }
    return [...conteo.entries()]
      .map(([subtipo, datos]) => {
        const servicio = SERVICIOS_SEMILLA.find((s) => s.subtipo === subtipo);
        return {
          subtipo,
          categoria: servicio?.categoria ?? 'CORTE UNISEX',
          cantidad: datos.cantidad,
          recaudacion: datos.recaudacion,
        };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  });

  readonly clientesFrecuentes = computed<ClienteFrecuente[]>(() => {
    const turnos = this.turnosDelMesSeleccionado();
    const conteo = new Map<string, number>();
    for (const turno of turnos) {
      conteo.set(turno.cliente.nombre, (conteo.get(turno.cliente.nombre) ?? 0) + 1);
    }
    return [...conteo.entries()]
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  });

  setMesSeleccionado(key: string): void {
    this._mesSeleccionado.set(key);
  }

  setCategoriaSeleccionada(categoria: CategoriaServicio | 'TODAS'): void {
    this._categoriaSeleccionada.set(categoria);
  }

  private mesKey(fecha: Date): string {
    return `${fecha.getFullYear()}-${fecha.getMonth()}`;
  }

  private mesLabel(fecha: Date): string {
    return fecha.toLocaleDateString('es-AR', { month: 'long', year: '2-digit' });
  }

  private turnosDelMesSeleccionado(): TurnoHistorico[] {
    return this._turnos().filter((t) => this.mesKey(t.inicio) === this._mesSeleccionado());
  }

  private filtradosPorCategoria(): TurnoHistorico[] {
    return this.turnosDelMesSeleccionado().filter(
      (t) => this._categoriaSeleccionada() === 'TODAS' || t.servicio.categoria === this._categoriaSeleccionada(),
    );
  }

  private generarTurnos(): TurnoHistorico[] {
    const rand = crearSemilla(42);
    const turnos: TurnoHistorico[] = [];
    const hoy = new Date();

    for (let m = 6; m >= 1; m--) {
      let mesAbs = hoy.getMonth() - m;
      let anioMes = hoy.getFullYear();
      if (mesAbs < 0) {
        mesAbs += 12;
        anioMes -= 1;
      }
      const diasEnMes = new Date(anioMes, mesAbs + 1, 0).getDate();
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(anioMes, mesAbs, dia);
        if (fecha.getDay() === 0) continue;
        const cantidad = 2 + Math.floor(rand() * 4);
        for (let i = 0; i < cantidad; i++) {
          const hora = 9 + Math.floor(rand() * 8);
          const inicio = new Date(anioMes, mesAbs, dia, hora, i % 2 === 0 ? 0 : 30, 0, 0);
          if (inicio > hoy) continue;
          const servicio = SERVICIOS_SEMILLA[Math.floor(rand() * SERVICIOS_SEMILLA.length)];
          const estadoRand = rand();
          const estado: TurnoHistorico['estado'] =
            estadoRand < 0.55
              ? 'Finalizado'
              : estadoRand < 0.85
                ? 'Confirmado'
                : estadoRand < 0.95
                  ? 'Cancelado'
                  : 'Pendiente';
          const cliente = CLIENTES_SEMILLA[Math.floor(rand() * CLIENTES_SEMILLA.length)];
          const profesional = PROFESIONALES[servicio.categoria === 'UÑAS' ? 1 : 0];
          turnos.push({ inicio, estado, servicio, cliente: { nombre: cliente }, profesional });
        }
      }
    }
    return turnos;
  }
}