# API del backend — Guía de integración para el frontend

> Backend FastAPI para un salón de belleza. Base URL: `http://localhost:8000`. Prefijo de API: **`/api/v1`**.
>
> - **Formato de datos:** JSON. Los nombres de campos van en **camelCase** (ej. `serviceTypeId`, `referenceImage`).
> - **Auth:** los endpoints protegidos usan `Authorization: Bearer <accessToken>`.
> - **Errores:** todos los errores usan el formato `{ "error": "...", "message": "...", "details": ... }` con estos códigos HTTP: 400 (inválido), 401 (no autenticado), 403 (sin permisos), 404 (no encontrado), 409 (conflicto/regla de negocio), 500 (interno).
> - Este documento refleja la implementación real (MVP completo). Ver `models.md` para el detalle de los modelos.

---

## Autenticación (`/auth`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/login` | Público | Iniciar sesión. |
| POST | `/auth/logout` | Cliente/Admin | Cerrar sesión (revoca el refresh token). |
| POST | `/auth/refresh` | Público | Renovar access token (rota el refresh). |
| POST | `/auth/forgot-password` | Público | Solicitar recuperación. Devuelve `resetToken` solo con `ENV=development`. |
| POST | `/auth/reset-password` | Público | Restaurar contraseña con el token. |
| GET | `/auth/me` | Cliente/Admin | Usuario autenticado. |

### POST /auth/login
```json
// Request
{ "email": "juan@example.com", "password": "password123" }
// Response 200
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": { "id": "<uuid>", "name": "Juan Pérez", "email": "juan@example.com", "phone": "+541112345678", "role": "Cliente" }
}
```
Errores: `401 InvalidCredentials` (email o password incorrectos). `user.role` puede ser `Public`, `Cliente` o `Admin`.

### POST /auth/refresh
```json
// Request
{ "refreshToken": "<refresh>" }
// Response 200: mismo shape que login (se rota el refresh; el viejo se invalida)
```
Errores: `401 InvalidRefreshToken` (incluye reuso de un refresh ya rotado/revocado).

### POST /auth/logout
```json
// Request (requiere auth Bearer + refresh en body)
{ "refreshToken": "<refresh>" }
// Response 204 (sin cuerpo)
```
Requiere el access token del usuario en el header.

### POST /auth/forgot-password
```json
// Request
{ "email": "juan@example.com" }
// Response 200 (siempre, no revela si el email existe)
{ "message": "Si el email existe, recibirás un enlace...", "resetToken": "<solo en dev>" }
```

### POST /auth/reset-password
```json
// Request
{ "token": "<resetToken>", "newPassword": "nuevaClave123" }
// Response 204
```
Errores: `400 InvalidResetToken` (inválido/expirado/usado).

### GET /auth/me
Requiere Bearer. Response: el objeto `user` (ver login).

---

## Configuración pública

### GET /config (Público)
```json
{ "businessName": "Salón de Belleza", "currency": "ARS", "timezone": "America/Argentina/Buenos_Aires", "allowRegistration": true }
```
Se usa para la landing y para saber si el registro está habilitado.

---

## Catálogo público (`/public`)

| Método | Endpoint | Auth |
|---|---|---|
| GET | `/public/services` | Público |
| GET | `/public/services/{serviceId}/types` | Público |
| GET | `/public/service-types/{serviceTypeId}` | Público |

### GET /public/services
Devuelve los servicios activos con sus tipos activos:
```json
[
  {
    "id": "<uuid>",
    "name": "CORTE UNISEX",
    "description": "Cortes para dama, niño y caballero",
    "referenceImage": { "id": "<uuid>", "url": null },
    "cancelable": true,
    "cancellationPeriodHours": 24,
    "types": [
      { "id": "<uuid>", "name": "caballero", "durationMinutes": 35, "price": 12000, "description": "...", "referenceImage": null }
    ]
  }
]
```
> `referenceImage` es `null` si no hay imagen; `url` será poblado cuando se integre storage real.

### GET /public/services/{serviceId}/types
```json
[ { "id": "<uuid>", "name": "caballero", "durationMinutes": 35, "price": 12000, "description": "...", "referenceImage": null } ]
```

### GET /public/service-types/{serviceTypeId}
```json
{ "id": "<uuid>", "name": "caballero", "durationMinutes": 35, "price": 12000, "description": "...", "referenceImage": null }
```

---

## Disponibilidad (`/availability`) — Público o Cliente

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/availability/calendar` | Días disponibles del mes, por lista de types. |
| GET | `/availability/slots` | Horarios disponibles de un día, por lista de types. |
| POST | `/availability/validate` | Validar un horario antes de confirmar. |

> **Importante:** estos endpoints reciben una **lista** de `serviceTypeIds` (una cita puede tener varios servicios). La duración y el precio son los **totales sumados**. La ocupación es **global**: un turno tomado bloquea el bloque horario, sin importar el servicio.

### GET /availability/calendar
```
GET /api/v1/availability/calendar?serviceTypeIds={id}&serviceTypeIds={id2}&month=2026-08
```
```json
{ "serviceTypes": [ { "id": "..", "name": "..", "durationMinutes": 35, "price": 12000 } ], "month": "2026-08", "availableDates": ["2026-08-18", "2026-08-19"] }
```

### GET /availability/slots
```
GET /api/v1/availability/slots?serviceTypeIds={id}&serviceTypeIds={id2}&date=2026-08-20
```
```json
{
  "serviceTypes": [ { "id": "..", "name": "caballero", "durationMinutes": 35, "price": 12000 } ],
  "date": "2026-08-20",
  "durationMinutes": 95,
  "price": 32000,
  "slots": [
    { "startTime": "10:00", "endTime": "11:35", "available": true },
    { "startTime": "10:30", "endTime": "12:05", "available": false }
  ]
}
```

### POST /availability/validate
```json
// Request
{ "serviceTypeIds": ["<uuid>"], "date": "2026-08-20", "startTime": "10:00" }
// Response 200
{ "available": true, "endTime": "10:35", "price": 12000 }
```
Errores: `409 SlotUnavailable` si el horario no está disponible (ocupado, fuera de horario, feriado o bloqueado).

---

## Citas del cliente (`/appointments`) — Cliente (dueño) o Admin

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/appointments` | Crear cita (con lista de services). |
| GET | `/appointments/{id}` | Ver detalle (dueño o Admin). |
| PATCH | `/appointments/{id}/cancel` | Cancelar la cita completa (regla estricta: todos los servicios deben permitirlo). |
| POST | `/appointments/{id}/services/{serviceTypeId}/cancel` | Cancelar **un solo servicio** (parcial). |
| POST | `/appointments/{id}/reschedule` | Reprogramar a nueva fecha/hora. |
| POST | `/appointments/{id}/reference-image` | Adjuntar imagen de referencia a la cita. |
| GET | `/appointments/{id}/cancellation-eligibility` | Por cada servicio: si se puede cancelar. |

### POST /appointments
```json
// Request
{
  "serviceTypeIds": ["<uuid-corte>", "<uuid-nutricion>"],
  "date": "2026-08-20",
  "startTime": "10:00",
  "referenceImageId": "<uuid-file-opcional>",
  "referenceComment": "Más corto de los costados"
}
// Response 201
{
  "id": "<uuid>",
  "humanId": "A3F9K2",
  "serviceTypes": [
    { "id": "..", "name": "caballero", "durationMinutes": 35, "price": 12000 },
    { "id": "..", "name": "nutrición", "durationMinutes": 60, "price": 20000 }
  ],
  "client": { "id": "..", "name": "Juan Pérez" },
  "startTime": "2026-08-20T10:00:00",
  "endTime": "2026-08-20T11:35:00",
  "durationMinutes": 95,
  "price": 32000,
  "referenceImage": null,
  "referenceComment": "Más corto de los costados",
  "status": "pendiente",
  "statusDetail": "Turno pendiente de confirmación"
}
```
- **`humanId`** es el identificador corto y amigable que el cliente puede usar para seguir su turno (por página, sin token). El precio y la duración se **congelan** al crear.
- Errores: `404 NotFound` (un type no existe/inactivo), `409 SlotUnavailable` (bloque ocupado), `422` (lista vacía).

### PATCH /appointments/{id}/cancel
```json
// Request
{ "reason": "Tuve un imprevisto" }
// Response 200 (mismo shape del detalle, status "cancelado")
```
Errores: `409 CannotCancel` (si algún servicio no permite cancelar o ya pasó su período de cancelación; `details.services` lista el motivo por servicio).

### POST /appointments/{id}/services/{serviceTypeId}/cancel
```json
// Request
{ "reason": "Ya no quiero la nutrición" }
// Response 200
```
Elimina ese servicio: baja `durationMinutes`, `price` y `endTime` se recortan. Si era el **último** servicio, la cita pasa a `cancelado`. Errores: `404` (servicio no está en la cita), `409 CannotCancel` (ese servicio no lo permite).

### POST /appointments/{id}/reschedule
```json
// Request
{ "date": "2026-08-22", "startTime": "18:00" }
// Response 200
```
"Reprograma" manteniendo los servicios actuales; valida disponibilidad del bloque. Errores: `409 SlotUnavailable`, `409 CannotReschedule` (si está cancelada/completada).

### POST /appointments/{id}/reference-image
```json
// Request
{ "referenceImageId": "<uuid-file>" }
// Response 200
```

### GET /appointments/{id}/cancellation-eligibility
```json
[
  { "cancellable": true, "reason": null, "cancelsBefore": "2026-08-19T10:00:00", "serviceTypeId": "<uuid>", "serviceName": "caballero" },
  { "cancellable": false, "reason": "El servicio 'nutrición' no permite cancelación", "cancelsBefore": null, "serviceTypeId": "<uuid>", "serviceName": "nutrición" }
]
```

---

## Archivos (`/files`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/files` | Cliente/Admin | Subir imagen (multipart). |
| GET | `/files/{fileId}` | Público/Auth | Descargar bytes. Privado → dueño o Admin. |
| DELETE | `/files/{fileId}` | Admin | Borrar archivo. |
| POST | `/files/presigned` | Admin | **Stub 501** (llega en Fase 2). |

### POST /files
Multipart con `file` y `entity`. Un **Cliente** solo puede usar `entity=appointment_reference`; el **Admin** puede usar cualquier entity (`services`, `service-types`, etc.).
```
POST /api/v1/files
Authorization: Bearer <token>
Content-Type: multipart/form-data
  file: <archivo>
  entity: appointment_reference
```
```json
// Response 201
{ "id": "<uuid>", "url": "/api/v1/files/<uuid>", "mimeType": "image/jpeg", "size": 245760, "entity": "appointment_reference", "createdAt": "..." }
```
El `id` que devuelve se usa como `referenceImageId` en la cita.

### GET /files/{fileId}
Devuelve el archivo binario con su `content-type`. Si `entity=appointment_reference` (privado), requiere el Bearer del dueño o de un Admin (si no → 403).

### DELETE /files/{fileId}
Solo Admin. Response `204`.

---

## Notificaciones y dispositivos — Cliente/Admin

| Método | Endpoint |
|---|---|
| GET | `/notifications` |
| GET | `/notifications/{id}` |
| PATCH | `/notifications/{id}/read` |
| GET | `/users/me/notification-settings` |
| PATCH | `/users/me/notification-settings` |
| POST | `/devices` |
| DELETE | `/devices/{deviceId}` |

### GET /notifications
```json
[ { "id": "..", "type": "reminder_2h", "title": "Recordatorio: tu turno es pronto", "body": "Tu cita #A3F9K2 comienza a las 10:00...", "referenceId": "<uuid>", "read": false, "createdAt": "..." } ]
```

### PATCH /users/me/notification-settings
```json
// Request
{ "emailReminders": true, "smsReminders": false, "whatsappReminders": true, "reminderHoursBefore": [24, 2] }
// Response 200: mismo shape
```

### POST /devices
```json
// Request
{ "platform": "android", "pushToken": "tok-abc" }
// Response 201
{ "id": "..", "platform": "android", "createdAt": "..." }
```
### DELETE /devices/{deviceId} → `204`

---

## Admin — Agenda y citas (rol Admin)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/admin/appointments` | Listar con filtros. |
| GET | `/admin/appointments/{id}` | Detalle. |
| PATCH | `/admin/appointments/{id}/status` | Cambiar estado (valida transiciones). |
| PATCH | `/admin/appointments/{id}/cancel` | Cancelar (sin regla de cliente). |
| POST | `/admin/appointments/{id}/reschedule` | Reprogramar. |
| GET | `/admin/appointments/{id}/history` | Historial de estados. |
| GET | `/admin/agenda` | Agenda diaria. |
| GET | `/admin/agenda/summary` | Resumen por rango. |

### GET /admin/appointments
Filtros combinables (query params): `date=YYYY-MM-DD`, `status=...`, `from=YYYY-MM-DD&to=YYYY-MM-DD`, `clientId=<uuid>`.
```json
[ /* array de Appointment (mismo shape del detalle de cita) */ ]
```

### PATCH /admin/appointments/{id}/status
```json
// Request
{ "status": "confirmado", "statusDetail": "Confirmado vía WhatsApp" }
// Response 200
```
Estados: `pendiente`, `confirmado`, `reprogramado`, `completado`, `cancelado`, `no_asiste`. Errores: `409 InvalidTransition` si la transición no es válida (p. ej. completar una cancelada).

### GET /admin/agenda?date=2026-08-20
```json
{
  "date": "2026-08-20",
  "appointments": [
    { "id": "..", "humanId": "A3F9K2", "startTime": "10:00", "endTime": "11:35", "clientName": "Juan Pérez", "serviceNames": ["caballero", "nutrición"], "price": 32000, "status": "confirmado" }
  ],
  "blockedSlots": [
    { "id": "..", "startTime": "13:00", "endTime": "14:00", "reason": "Almuerzo" },
    { "id": "..", "reason": "Feriado: 20 de agosto" }
  ]
}
```

### GET /admin/agenda/summary?from=2026-08-01&to=2026-08-31
```json
{ "fromDate": "2026-08-01", "toDate": "2026-08-31", "total": 12, "byStatus": { "pendiente": 5, "completado": 6, "cancelado": 1 }, "totalRevenue": 150000 }
```

---

## Admin — Usuarios y clientes (rol Admin)

| Método | Endpoint |
|---|---|
| GET/POST | `/admin/users` |
| GET/PATCH | `/admin/users/{userId}` |
| GET | `/admin/users/{userId}/appointments` |
| GET | `/admin/clients` |
| GET | `/admin/clients/{clientId}/summary` |

### POST /admin/users
```json
// Request
{ "name": "Juan Pérez", "email": "juan@example.com", "phone": "+541112345678", "password": "clave123", "role": "Cliente" }
// Response 201
{ "id": "..", "name": "Juan Pérez", "email": "juan@example.com", "phone": "...", "role": "Cliente", "active": true, "createdAt": "..." }
```
> Este es el ala de creación de clientes (no hay registro público).

### PATCH /admin/users/{userId}
Campos opcionales: `name`, `email`, `phone`, `role`, `active`, `password`. Response: el user actualizado.

### GET /admin/clients/{clientId}/summary
```json
{ "clientId": "..", "name": "Juan Pérez", "email": "..", "phone": "..", "totalAppointments": 12, "upcomingAppointments": 1, "completedAppointments": 10, "cancelledAppointments": 1, "lastAppointmentDate": "2026-08-01" }
```

---

## Admin — Configuración del negocio (rol Admin)

### Settings generales
| Método | Endpoint |
|---|---|
| GET/PATCH | `/admin/settings` |
```json
// PATCH /admin/settings — campos opcionales
{ "businessName": "Nuevo Salón", "currency": "ARS", "timezone": "America/Argentina/Buenos_Aires", "allowRegistration": true }
```

### Horarios de atención
| Método | Endpoint |
|---|---|
| GET/PATCH | `/admin/settings/business-hours` |
```json
// GET devuelve
[ { "id": "..", "dayOfWeek": 0, "openTime": "09:00:00", "closeTime": "19:00:00", "active": true } ]
// PATCH reemplaza TODA la lista
[ { "dayOfWeek": 0, "openTime": "09:00:00", "closeTime": "19:00:00", "active": true } ]
```
> `dayOfWeek`: lunes = 0 … domingo = 6. El `PATCH` es reemplazo total (no merge).

### Feriados
| Método | Endpoint |
|---|---|
| GET/POST | `/admin/settings/holidays` |
| DELETE | `/admin/settings/holidays/{holidayId}` |
```json
// POST
{ "date": "2026-12-25", "reason": "Navidad" }
```

### Bloqueos de agenda
| Método | Endpoint |
|---|---|
| GET/POST | `/admin/settings/blocks` |
| PATCH/DELETE | `/admin/settings/blocks/{blockId}` |
```json
// POST — bloqueo puntual
{ "date": "2026-08-20", "startTime": "13:00:00", "endTime": "14:00:00", "reason": "Almuerzo" }
// POST — bloqueo por rango (vacaciones)
{ "startDate": "2026-09-01", "endDate": "2026-09-08", "reason": "Vacaciones" }
```

---

## Jobs internos (`/internal`) — Service token

| Método | Endpoint |
|---|---|
| POST | `/internal/reminders/send` |
| POST | `/internal/appointments/mark-completed` |
| POST | `/internal/appointments/mark-no-show` |

Se autentican con `Authorization: Bearer <SERVICE_TOKEN>` (no sesión de usuario). Respuestas tipo:
```json
{ "processed": 15, "updated": 14 }
```
o para reminders: `{ "processed": 15, "created": 14 }`.

---

## Flujo recomendado "Nueva cita" (cliente)

```txt
1. GET /api/v1/config                     → datos públicos del negocio
2. GET /api/v1/public/services            → lista de servicios con tipos
3. GET /api/v1/availability/calendar?serviceTypeIds=...&month=YYYY-MM  → días disponibles
4. GET /api/v1/availability/slots?serviceTypeIds=...&date=YYYY-MM-DD   → horarios disponibles
5. POST /api/v1/availability/validate     → confirmar que el horario sigue libre
6. POST /api/v1/files (entity=appointment_reference)  → subir imagen de referencia (opcional)
7. POST /api/v1/appointments              → crear la cita (lista de serviceTypeIds)
```

## Ejemplos de consumo (curl)

```bash
# Login
curl -s -X POST localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"juan@example.com","password":"password123"}'

# Crear cita (con token)
curl -s -X POST localhost:8000/api/v1/appointments \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"serviceTypeIds":["<corte>","<nutricion>"],"date":"2026-08-20","startTime":"10:00"}'
```