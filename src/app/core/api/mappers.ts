import type {
  AgendaAppointment,
  Appointment,
  AppointmentStatus,
  BusinessHour,
  Service,
} from './backend.models';
import type { CategoriaServicio, Servicio } from '../models/servicio.model';
import type { DiaSemana, FranjaLaboral } from '../models/franja-laboral.model';
import type { EstadoTurno, Turno } from '../models/turno.model';

export const CATEGORIAS: CategoriaServicio[] = [
  'CORTE UNISEX',
  'TRATAMIENTOS CAPILARES',
  'COLOR',
  'UÑAS',
];

const DIAS_SEMANA: DiaSemana[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const ESTADO_BACKEND_TO_UI: Record<AppointmentStatus, EstadoTurno> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  reprogramado: 'Reprogramado',
  completado: 'Finalizado',
  cancelado: 'Cancelado',
  no_asiste: 'No Asiste',
};

export const ESTADO_UI_TO_BACKEND: Record<EstadoTurno, AppointmentStatus> = {
  Pendiente: 'pendiente',
  Confirmado: 'confirmado',
  Reprogramado: 'reprogramado',
  'En Proceso': 'confirmado',
  Finalizado: 'completado',
  Cancelado: 'cancelado',
  'No Asiste': 'no_asiste',
};

export function formatearFechaISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function horaADate(dia: Date, hora: string): Date {
  const [h, m] = hora.split(':').map(Number);
  const fecha = new Date(dia);
  fecha.setHours(h ?? 0, m ?? 0, 0, 0);
  return fecha;
}

export function categorizarServicio(nombre: string): CategoriaServicio {
  const normalizado = nombre.trim().toUpperCase();
  return CATEGORIAS.find((c) => c === normalizado) ?? 'CORTE UNISEX';
}

export function serviceToServicios(service: Service): Servicio[] {
  return service.types.map((type) => ({
    id: type.id,
    serviceId: service.id,
    categoria: service.name,
    subtipo: type.name,
    duracionMinutos: type.durationMinutes,
    precioBase: type.price,
  }));
}

export function agendaAppointmentToTurno(
  app: AgendaAppointment,
  dia: Date,
  catalogoPorSubtipo: ReadonlyMap<string, Servicio>,
): Turno {
  return turnoDesdeFuente(
    {
      id: app.id,
      clienteNombre: app.clientName,
      serviceNames: app.serviceNames,
      price: app.price,
      duracionMinutos: 60,
      status: app.status,
      inicio: horaADate(dia, app.startTime),
      fin: horaADate(dia, app.endTime),
    },
    catalogoPorSubtipo,
  );
}

export function appointmentToTurno(
  app: Appointment,
  catalogoPorSubtipo: ReadonlyMap<string, Servicio>,
): Turno {
  return turnoDesdeFuente(
    {
      id: app.id,
      clienteNombre: app.client.name,
      serviceNames: app.serviceTypes.map((t) => t.name),
      price: app.price,
      duracionMinutos: app.durationMinutes,
      status: app.status,
      inicio: new Date(app.startTime),
      fin: new Date(app.endTime),
    },
    catalogoPorSubtipo,
  );
}

interface TurnoFuente {
  id: string;
  clienteNombre: string;
  serviceNames: string[];
  price: number;
  duracionMinutos: number;
  status: AppointmentStatus;
  inicio: Date;
  fin: Date;
}

function turnoDesdeFuente(
  fuente: TurnoFuente,
  catalogoPorSubtipo: ReadonlyMap<string, Servicio>,
): Turno {
  const primerServicio = fuente.serviceNames[0] ?? 'Servicio';
  const base = catalogoPorSubtipo.get(primerServicio);
  const categoria = base?.categoria ?? 'CORTE UNISEX';
  // La categoría viene del backend con su nombre real ("Uñas", "uñas"...).
  const esUnias = categoria.trim().toUpperCase() === 'UÑAS';
  const profesional = esUnias ? 'Camila' : 'Sofía';
  return {
    id: fuente.id,
    cliente: { nombre: fuente.clienteNombre, telefono: '' },
    servicio: {
      id: base?.id ?? fuente.id,
      categoria,
      subtipo: primerServicio,
      duracionMinutos: base?.duracionMinutos ?? fuente.duracionMinutos,
      precioBase: fuente.price,
    },
    profesional,
    inicio: fuente.inicio,
    fin: fuente.fin,
    estado: ESTADO_BACKEND_TO_UI[fuente.status],
    recordatorioEnviado: false,
  };
}

export function businessHourToFranja(bh: BusinessHour): FranjaLaboral {
  return {
    dia: DIAS_SEMANA[bh.dayOfWeek] ?? 'Domingo',
    activo: bh.active,
    horaInicio: bh.openTime.slice(0, 5),
    horaFin: bh.closeTime.slice(0, 5),
  };
}

export function franjaToBusinessHour(franja: FranjaLaboral): Omit<BusinessHour, 'id'> {
  const dayOfWeek = DIAS_SEMANA.indexOf(franja.dia);
  return {
    dayOfWeek: dayOfWeek >= 0 ? dayOfWeek : 0,
    openTime: `${franja.horaInicio}:00`,
    closeTime: `${franja.horaFin}:00`,
    active: franja.activo,
  };
}
