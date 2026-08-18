# Modelos / tipos de datos — Backend para el frontend

> Tipos que el frontend puede tipar (TS/JSON). Los nombres siguen el **camelCase** de la API. Los UUID se manejan como strings; las fechas como strings ISO-8601 (las horas de citas son naive, hora local del salón).

## Enums / constantes

### Rol de usuario (`role`)
```ts
type Role = "Public" | "Cliente" | "Admin";
```

### Estado de una cita (`status`)
```ts
type AppointmentStatus =
  | "pendiente"   // creada, esperando confirmación
  | "confirmado"  // confirmada por el admin
  | "reprogramado"
  | "completado"  // asistió / turno finalizado
  | "cancelado"
  | "no_asiste";  // no se presentó
```

### Tipos de archivo (`entity`)
```ts
// Admin puede usar cualquier entidad; Cliente solo "appointment_reference"
type FileEntity = "appointment_reference" | "services" | "service-types" | string;
```

---

## Usuario

```ts
interface User {
  id: string;      // uuid
  name: string;
  email: string;
  phone: string | null;
  role: Role;
}

// Respuesta de /auth/login y /auth/refresh
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

---

## Configuración pública

```ts
interface PublicConfig {
  businessName: string;
  currency: string;   // "ARS"
  timezone: string;   // "America/Argentina/Buenos_Aires"
  allowRegistration: boolean;
}
```

---

## Catálogo

```ts
interface ReferenceImage {
  id: string;          // uuid (de /files)
  url: string | null;  // null hasta integrar storage real
}

interface ServiceType {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;                 // en moneda base (enteros, ej. 12000)
  description: string | null;
  referenceImage: ReferenceImage | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  referenceImage: ReferenceImage | null;
  cancelable: boolean;
  cancellationPeriodHours: number;
  types: ServiceType[];          // solo en /public/services
}
```

---

## Disponibilidad

```ts
interface AvailabilityServiceType {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

interface Slot {
  startTime: string;  // "10:00"
  endTime: string;    // "11:35"
  available: boolean;
}

// GET /availability/calendar
interface CalendarResponse {
  serviceTypes: AvailabilityServiceType[];
  month: string;              // "2026-08"
  availableDates: string[];   // ["2026-08-18", ...]
}

// GET /availability/slots  — durationMinutes y price son los TOTALES sumados
interface SlotsResponse {
  serviceTypes: AvailabilityServiceType[];
  date: string;               // "2026-08-20"
  durationMinutes: number;    // suma de todos los types
  price: number;              // suma de todos los types
  slots: Slot[];
}

// POST /availability/validate
interface ValidateRequest {
  serviceTypeIds: string[];
  date: string;
  startTime: string; // "10:00"
}
interface ValidateResponse {
  available: boolean;
  endTime: string | null;
  price: number | null;
}
```

---

## Citas

```ts
interface AppointmentServiceLine {
  id: string;                 // id del serviceType (instantánea de precio/duración al reservar)
  name: string;
  durationMinutes: number;
  price: number;
}

interface AppointmentClient {
  id: string;
  name: string;
}

interface Appointment {
  id: string;                 // uuid real
  humanId: string;            // ID corto y amigable para el cliente (ej. "A3F9K2")
  serviceTypes: AppointmentServiceLine[];
  client: AppointmentClient;
  startTime: string;          // "2026-08-20T10:00:00"
  endTime: string;            // "2026-08-20T11:35:00"
  durationMinutes: number;    // suma de los servicios
  price: number;              // total congelado
  referenceImage: ReferenceImage | null;
  referenceComment: string | null;
  status: AppointmentStatus;
  statusDetail: string | null;
}

// POST /appointments
interface CreateAppointmentRequest {
  serviceTypeIds: string[];        // min 1
  date: string;                    // "2026-08-20"
  startTime: string;               // "10:00"
  referenceImageId?: string | null; // id de /files
  referenceComment?: string | null;
}

// PATCH /appointments/{id}/cancel  y  /services/{serviceTypeId}/cancel
interface CancelRequest { reason: string; }

// POST /appointments/{id}/reschedule
interface RescheduleRequest { date: string; startTime: string; }

// GET /appointments/{id}/cancellation-eligibility
interface ServiceCancellationEligibility {
  cancellable: boolean;
  reason: string | null;
  cancelsBefore: string | null;    // fecha-hora límite para cancelar
  serviceTypeId: string;
  serviceName: string;
}
```

---

## Archivos

```ts
// POST /files (multipart: file + entity)
interface FileResponse {
  id: string;
  url: string;        // "/api/v1/files/<id>"
  mimeType: string;   // "image/jpeg"
  size: number;
  entity: string;
  createdAt: string;
}
```

---

## Notificaciones y dispositivos

```ts
interface Notification {
  id: string;
  type: string;        // ej. "reminder_2h"
  title: string;
  body: string | null;
  referenceId: string | null;  // id de la cita relacionada (opcional)
  read: boolean;
  createdAt: string;
}

interface NotificationSettings {
  emailReminders: boolean;
  smsReminders: boolean;
  whatsappReminders: boolean;
  reminderHoursBefore: number[];   // ej. [24, 2]
}
// PATCH /users/me/notification-settings recibe cualquier subconjunto de estos campos

interface Device {
  id: string;
  platform: string;   // "android" | "ios" | ...
  createdAt: string;
}
// POST /devices body: { platform, pushToken }
```

---

## Admin — Agenda

```ts
interface AgendaAppointment {
  id: string;
  humanId: string;
  startTime: string;   // "10:00"
  endTime: string;     // "11:35"
  clientName: string;
  serviceNames: string[];
  price: number;
  status: AppointmentStatus;
}

interface BlockedSlot {
  id: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;  // ej. "Almuerzo" o "Feriado: ..."
}

// GET /admin/agenda?date=YYYY-MM-DD
interface Agenda {
  date: string;
  appointments: AgendaAppointment[];
  blockedSlots: BlockedSlot[];
}

// GET /admin/agenda/summary?from&to
interface AgendaSummary {
  fromDate: string;
  toDate: string;
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  totalRevenue: number;
}

// POST /admin/appointments/{id}/status
interface StatusUpdateRequest { status: AppointmentStatus; statusDetail?: string | null; }

// GET /admin/appointments/{id}/history
interface StatusHistoryItem { status: AppointmentStatus; statusDetail: string | null; changedAt: string; }
```

---

## Admin — Usuarios y clientes

```ts
interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  active: boolean;
  createdAt: string;
}

// POST /admin/users
interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string | null;
  password: string;   // min 6
  role: Role;         // normalmente "Cliente"
}

// PATCH /admin/users/{id} — cualquier subconjunto
interface UpdateUserRequest {
  name?: string; email?: string; phone?: string | null;
  role?: Role; active?: boolean; password?: string;
}

// GET /admin/clients/{id}/summary
interface ClientSummary {
  clientId: string;
  name: string;
  email: string;
  phone: string | null;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  lastAppointmentDate: string | null;
}
```

---

## Admin — Configuración del negocio

```ts
interface BusinessSettings {
  id: number;               // siempre 1 (fila única)
  businessName: string;
  currency: string;
  timezone: string;
  allowRegistration: boolean;
}
// PATCH /admin/settings — cualquier subconjunto

interface BusinessHour {
  id: string;
  dayOfWeek: number;       // lunes = 0 … domingo = 6
  openTime: string;        // "09:00:00"
  closeTime: string;       // "19:00:00"
  active: boolean;
}
// PATCH /admin/settings/business-hours — REEMPLAZO total de la lista

interface Holiday { id: string; date: string; reason: string | null; }

interface Block {
  id: string;
  date: string | null;              // bloqueo puntual
  startDate: string | null;         // bloqueo por rango (vacaciones)
  endDate: string | null;
  startTime: string | null;         // "13:00:00"
  endTime: string | null;
  reason: string | null;
}
// POST /admin/settings/blocks — body sin id (id auto)
```

---

## Errores

```ts
interface ApiError {
  error: string;        // código corto: "InvalidCredentials", "SlotUnavailable", "InvalidTransition", ...
  message: string;      // descripción legible
  details: unknown | null;
}
```
Códigos HTTP: `400` inválido · `401` no autenticado · `403` sin permisos · `404` no encontrado · `409` conflicto/regla · `422` validación de entrada · `500` interno.

### Convenciones útiles para el frontend
- Manejar 401 → borrar tokens y redirigir a login.
- Manejar 403 → ocultar acciones no permitidas por rol.
- Manejar 409 → mostrar `details` o `message` (ej. "el horario ya está tomado", "este servicio no se puede cancelar").