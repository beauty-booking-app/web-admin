export type Role = 'Public' | 'Cliente' | 'Admin';

export type AppointmentStatus =
  | 'pendiente'
  | 'confirmado'
  | 'reprogramado'
  | 'completado'
  | 'cancelado'
  | 'no_asiste';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PublicConfig {
  businessName: string;
  currency: string;
  timezone: string;
  allowRegistration: boolean;
}

export interface ReferenceImage {
  id: string;
  url: string | null;
}

export interface ServiceType {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
  referenceImage: ReferenceImage | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  referenceImage: ReferenceImage | null;
  cancelable: boolean;
  cancellationPeriodHours: number;
  types: ServiceType[];
}

export interface AgendaAppointment {
  id: string;
  humanId: string;
  startTime: string;
  endTime: string;
  clientName: string;
  serviceNames: string[];
  price: number;
  status: AppointmentStatus;
}

export interface BlockedSlot {
  id: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

export interface Agenda {
  date: string;
  appointments: AgendaAppointment[];
  blockedSlots: BlockedSlot[];
}

export interface AgendaSummary {
  fromDate: string;
  toDate: string;
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  totalRevenue: number;
}

export interface AppointmentServiceLine {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface AppointmentClient {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  humanId: string;
  serviceTypes: AppointmentServiceLine[];
  client: AppointmentClient;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  price: number;
  referenceImage: ReferenceImage | null;
  referenceComment: string | null;
  status: AppointmentStatus;
  statusDetail: string | null;
}

export interface StatusUpdateRequest {
  status: AppointmentStatus;
  statusDetail?: string | null;
}

export interface BusinessHour {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  active: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  details: unknown | null;
}
