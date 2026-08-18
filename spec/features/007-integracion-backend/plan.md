# 007 · Integración con el Backend Real — Plan

## Enfoque

Se agrega una **capa API en el core** (`src/app/core/api/`) que encapsula el backend real: configuración de URL, tipos del backend (camelCase), cliente HTTP con manejo de errores, autenticación (tokens + interceptor + guard) y **mappers** que traducen los modelos del backend a los modelos de dominio existentes (`Turno`, `Servicio`, `FranjaLaboral`) para no refactorizar la UI completa. Los state services de cada feature pasan a cargar datos de la API y a persistir lo que la API soporta; lo que la API no expone (ABM de servicios, alta local de turnos, recordatorios sin teléfono) conserva su comportamiento actual.

Los state services son la fuente de verdad de la UI; la API se consume vía `HttpClient` con `provideHttpClient(withInterceptors([...]))`. Cada feature expone señales `cargando` y `error` para la UI de carga/error elegida por el usuario ("mostrar error y vacío", sin fallback a semilla).

## Implementación

### 1. Capa API core (`src/app/core/api/`)
- **`environment.ts`** — `API_BASE_URL = 'http://localhost:8000'` y `API_URL = '${API_BASE_URL}/api/v1'`.
- **`backend.models.ts`** — interfaces del backend copiadas de `docs/backend/models.md`: `User`, `AuthResponse`, `PublicConfig`, `Service`, `ServiceType`, `ReferenceImage`, `AppointmentStatus`, `AgendaAppointment`, `Agenda`, `BlockedSlot`, `AgendaSummary`, `Appointment`, `BusinessHour`, `ApiError`, etc.
- **`auth.service.ts`** — signals `accessToken`, `refreshToken`, `usuario`; métodos `login()`, `logout()`, `refresh()`, `cargarUsuario()`. Persistencia en `localStorage` y `estaAutenticado` computed.
- **`auth.interceptor.ts`** — `HttpInterceptorFn` que inyecta `Authorization: Bearer <accessToken>`; en respuesta 401 intenta `refresh()` una vez y reintenta la petición; si el refresh falla, limpia sesión y navega a `/login`.
- **`auth.guard.ts`** — guard funcional: si no hay sesión, redirige a `/login`.
- **`mappers.ts`** — funciones puras de traducción:
  - `agendaAppointmentToTurno()` (backend → `Turno`) con mapa de estados (`pendiente→Pendiente`, `confirmado→Confirmado`, `reprogramado→Reprogramado`, `completado→Finalizado`, `cancelado→Cancelado`, `no_asiste→No Asiste`).
  - `serviceToServicios()` (Service + types → `Servicio[]`).
  - `businessHourToFranja()` y `franjaToBusinessHour()` (`FranjaLaboral` ↔ `BusinessHour`).
  - Resolución de profesional por categoría (UÑAS → Camila, resto → Sofía).

### 2. Autenticación (`src/app/features/auth/`)
- `auth.routes.ts` — ruta `/login` fuera del layout admin.
- `login-page.component.ts` — formulario email + password (template-driven, siguiendo el estilo del proyecto), mensaje de error del backend (401 → "Credenciales inválidas"), submit → `auth.login()` → redirige a `/`.
- `app.routes.ts` — agregar `/login` y proteger `AdminLayoutComponent` con `authGuard`.

### 3. Conexión por feature
- **Agenda (`TurnosStateService`):**
  - `cargarAgenda(fecha: Date)` → `GET /admin/agenda?date=YYYY-MM-DD`, mapea `AgendaAppointment[]` a `Turno[]` (con catálogo cargado previamente para resolver categoría/profesional).
  - `cambiarEstado()` persiste con `PATCH /admin/appointments/{id}/status` (mapeo frontend→backend; `En Proceso` queda local porque la API no lo tiene).
  - Señales `cargando` y `error`. `agregarTurno()` (alta local) y el resto de computeds quedan igual.
  - Nuevos estados `Reprogramado` y `No Asiste` en `EstadoTurno` + entradas de `STATUS_CONFIG` en el timeline.
- **Servicios (`ServiciosService`):** `cargarServicios()` → `GET /public/services`, `Service + types → Servicio[]`. `agregar()`/`editar()` siguen en memoria. `turno-form-modal` y `servicio-list` pasan a consumir el catálogo del servicio (no la semilla).
- **Horarios (`HorariosService`):** `cargarFranjas()` → `GET /admin/settings/business-hours`; `guardar()` → `PATCH /admin/settings/business-hours` con reemplazo total. Señales `cargando` y `error`; toast de éxito solo si el PATCH responde OK.
- **Analytics (`AnalyticsService`):** `cargarHistorico()` → para cada uno de los últimos 6 meses `GET /admin/appointments?from=YYYY-MM-01&to=fin-de-mes`; construye el dataset interno (TurnoHistorico) y los computeds existentes siguen igual. Señales `cargando` y `error`.

### 4. UI de carga/error
- Banner de error (rol `alert`) y estado vacío en `agenda-page`, `servicio-list`, `horarios-page` y `analytics-page`, controlados por las señales `cargando`/`error` de cada servicio.
- La agenda se carga al montar `AgendaPageComponent` (día de hoy).

### 5. Config
- `app.config.ts`: `provideHttpClient(withInterceptors([authInterceptor]))`.

### 6. Recordatorios
- `RecordatorioService` sigue igual; `turno.cliente.telefono` puede ser vacío (limitación de la API). En `recordatorios-page` y `hero-turnos` se deshabilita el botón de WhatsApp cuando no hay teléfono.

### 7. Validación y docs
- `npm run build` y `npm test`.
- Actualizar `docs/ARQUITECTURA.md`, `docs/CAMBIOS.md`, `AGENTS.md` y el roadmap (`spec/constitution/roadmap.md`).

## Decisiones

- **Mappers en vez de refactor total** — Los modelos de dominio de la UI (español, `Turno`/`Servicio`/`FranjaLaboral`) se conservan y se traducen desde los modelos del backend. Mantiene la UI estable y acota el riesgo.
- **Auth en core** — `AuthService` + interceptor + guard viven en `core/api/` porque aplican a toda la app, no a una feature.
- **`provideHttpClient` con interceptores funcionales** — patrón oficial de Angular 22; `HttpClient` se reserva para flujos HTTP (los signals siguen para el estado local).
- **Sin fallback a semilla** — decisión del usuario: si la API falla se muestra error y vacío.
- **"Iniciar" (En Proceso) local** — el backend no tiene estado "en proceso"; se mantiene como estado transitorio de la UI y se persiste al completar (→ `completado`).

## Riesgos

- **Campos ausentes en la API** (profesional, teléfono, categoría en la agenda) — Mitigado con heurísticas (categoría por catálogo, profesional por categoría) y degradación controlada (sin botón WhatsApp si no hay teléfono).
- **6 estados del backend vs 5 de la UI** — Mitigado agregando `Reprogramado` y `No Asiste` al modelo y al `STATUS_CONFIG`.
- **CORS en dev** — El backend FastAPI debe permitir `http://localhost:4200`. Si falla, el interceptor no es el problema; validar con el usuario.
- **Tests existentes** — `agenda-pdf.service.spec.ts` usa turnos manuales; se mantiene. El interceptor/HttpClient no afecta tests sin `provideHttpClient`.
- **Refresh concurrente** — Múltiples 401 simultáneos disparan refrescos duplicados; se serializa con una promesa compartida.
