# Registro de cambios

## Fix · Quitar sección "Personal" del sidebar (2026-08-18)

- Se eliminó la sección "Personal" del sidebar (filtros "Ver Todo el Equipo", Sofía y Camila). El signal `filtroProfesional` queda en el servicio (sin UI) y el calendario sigue filtrando con el valor por defecto.

## Fix · Alinear navbar de la agenda con el divider del sidebar (2026-08-18)

- El header de la agenda pasó de `h-16` a `h-[69px]` para que su borde inferior quede alineado con el divider que hay debajo del logo de la marca en la sidebar.

## Fix · Agenda: fecha estática con día y hora de hoy (2026-08-18)

- En la agenda del día, el selector de fecha dejó de ser navegable: se quitaron las flechas ‹ › y ahora el bloque muestra el día y la hora de hoy de forma estática, con alto (`h-9`) igual a los botones de la derecha (EXPORTAR PDF / AGENDAR TURNO).

## Fix · Reordenar navegación del calendario (2026-08-18)

- En `/calendario`, "Hoy" quedó como botón aparte y las flechas ‹ › pasaron a flanquear el texto del período visible.

## Fix · Sidebar a altura completa (2026-08-18)

- El sidebar (y el layout) ahora ocupa el 100% del alto de la ventana. Se agregó `height: 100%` a `html`, `body` y `app-root` (faltaba la altura en el `<html>`/`app-root`, cortando la cadena `h-full`).

## Fix · Bloque de facturación fijo al final del sidebar (2026-08-18)

- El bloque de "Facturación Estimada Hoy" junto con el estado del salón se agruparon en una zona inferior fija del sidebar: quedan anclados al pie y siempre visibles aunque el menú tenga scroll.

## Fix · Quitar badge "En Vivo" del sidebar (2026-08-18)

- Se eliminó el badge "En Vivo" del encabezado de la barra lateral (informativo pero redundante/no deseado).

## Fix · Sacar card de métricas de analytics (2026-08-18)

- Se quitó la card "Resumen Operativo y Métricas Clave" del dashboard de analytics (su dato más útil, facturación de hoy, ya vive en el sidebar).
- Se eliminó el componente `MetricasComponent` (quedaba sin uso).

## Fix · Facturación estimada hoy en el sidebar (2026-08-18)

- El sidebar muestra una card con la "Facturación Estimada Hoy" (con `currencyArs`) arriba del bloque "Estado del Salón".

## Fix · Mover métricas al dashboard de analytics (2026-08-18)

- La card "Resumen Operativo y Métricas Clave (Mes Actual)" (`MetricasComponent`) se movió de la agenda del día al dashboard de analytics (`/analytics`).
- `AnalyticsPageComponent` ahora también carga la agenda del día (`TurnosStateService.cargarAgenda()`) para que la card tenga datos al entrar directo a analytics.
- Se quitó del `AgendaPageComponent`.

## 009 · Migración a pnpm (2026-08-18)

- `packageManager` en `package.json` pasa de `npm@12.0.1` a `pnpm@10.31.0`; `angular.json` (`cli.packageManager`) a `pnpm`.
- Se reemplaza `package-lock.json` por `pnpm-lock.yaml` (instalación con pnpm).
- `.vscode/settings.json` con `npm.packageManager: "pnpm"` para que las tareas de VS Code usen pnpm.
- Comandos actualizados a `pnpm` en `AGENTS.md`, `README.md`, `docs/ARQUITECTURA.md` y `spec/constitution/tech-stack.md`.
- Build y tests (12) OK con pnpm.

## 008 · Calendario semana/mes (2026-08-18)

- Nuevo `CalendarioService` (`features/turnos/services/`) con vistas **semana** y **mes**: carga `GET /admin/appointments?from&to` para el rango visible, agrupa por día y respeta el filtro de profesional. Funciones puras exportadas (`lunesDe`, `rangoPeriodo`, `agruparPorDia`) testeables.
- Nuevo mapper `appointmentToTurno()` en `core/api/mappers.ts` (modelo `Appointment` → `Turno`, datetime ISO completo), con la lógica común extraída en `turnoDesdeFuente()` junto a `agendaAppointmentToTurno()`.
- Nueva página `/calendario` (`CalendarioPageComponent`): toggle Semana|Mes, navegación ‹ › y "Hoy", grilla semanal de 7 columnas con tarjetas compactas y grilla mensual con hasta 3 turnos por celda + "+N más". Hoy resaltado. Click en un día o turno navega a la agenda del día con esa fecha.
- `TurnosStateService.irAlDia(fecha)` para que el calendario abra la agenda del día con la fecha elegida (reusado por ir al día anterior/siguiente).
- `STATUS_CONFIG` y `CATEGORY_CONFIG` movidos a `components/status-config.ts` (compartidos entre timeline y calendario).
- Enlace "Calendario" en el sidebar.
- Sin cambios en el backend (se usa `GET /admin/appointments?from&to` existente).
- Tests nuevos del service (4 casos: `lunesDe`, `rangoPeriodo`, `agruparPorDia`).
- Sin dependencias nuevas.

## 007 · Integración con el Backend Real (2026-08-18)

- Nueva capa API en `src/app/core/api/`: `environment.ts` (`http://localhost:8000/api/v1`), `backend.models.ts` (tipos del backend en camelCase), `mappers.ts` (backend ↔ modelos de dominio), `error-utils.ts` (mensajes de error).
- **Auth:** nuevo `AuthService` (login/logout/refresh, tokens en `localStorage`), `authInterceptor` (Bearer + refresh automático en 401), `authGuard` y pantalla `/login` (`features/auth/`). Rutas admin protegidas; logout en el sidebar.
- **Agenda:** `TurnosStateService` ahora carga `GET /admin/agenda?date=...` y persiste estados con `PATCH /admin/appointments/{id}/status`. Se agregaron estados `Reprogramado` y `No Asiste` (fidelidad con el backend). Navegación día anterior/siguiente funcional.
- **Servicios:** `ServiciosService.cargarServicios()` desde `GET /public/services` (Service + types → `Servicio`). El ABM (agregar/editar) sigue en memoria (la API no expone CRUD admin). El modal de nuevo turno consume el catálogo del backend.
- **Horarios:** `cargarFranjas()` y `guardar()` contra `GET/PATCH /admin/settings/business-hours` (PATCH de reemplazo total).
- **Analytics:** `cargarHistorico()` obtiene las citas de los últimos 6 meses con `GET /admin/appointments?from&to` y computa KPIs, turnos/ganancias, top servicios y clientes frecuentes con datos reales.
- **Recordatorios:** los turnos del backend no incluyen teléfono; el envío de WhatsApp se deshabilita cuando no hay teléfono.
- **UI:** estados de carga y banners de error por feature (sin fallback a semilla).
- Config: `provideHttpClient(withInterceptors([authInterceptor]))` en `app.config.ts`.
- Sin dependencias nuevas.

## 006 · Exportación de Agenda (2026-08-17)

- Se instaló **jsPDF** (`^4.2.1`) — dependencia aprobada.
- Nuevo `AgendaPdfService.exportarDia()` que genera y descarga `agenda-YYYY-MM-DD.pdf` con cabecera del salón, fecha, secciones por profesional (Sofía/Camila) y filas de turnos (hora, cliente, servicio, estado, precio, teléfono) con salto de página y manejo de agenda vacía.
- Botón "Exportar PDF" accesible en la cabecera de la agenda (`HeaderBarComponent`).
- Nuevos tests del servicio con `jsPDF` mockeado (4 tests en suite).

## 005 · Dashboard de Analytics (2026-08-17)

- Nueva feature `analytics/` con ruta lazy `/analytics` e ítem en el sidebar.
- Nuevo `AnalyticsService` con dataset histórico generado de 6 meses (determinístico con semilla), `computed` de KPIs, turnos por mes, ganancias con diferencia %, servicios más solicitados (filtro por categoría y mes) y clientes frecuentes.
- Nueva página `AnalyticsPageComponent` con gráficos de barras CSS accesibles (`role="img"` + `aria-label`), KPIs y filtros navegables.
- Sin dependencias nuevas.

## Fix test (2026-08-17)

- Corregido `app.spec.ts:21` que fallaba por un test de andamiaje obsoleto: esperaba un `<h1>` que ya no existe. Ahora verifica la presencia del `<router-outlet />`.

## 004 · Recordatorios (2026-08-17)

- Nuevo servicio `RecordatorioService` que filtra turnos `Pendiente` del día desde `TurnosStateService`.
- Nueva utilidad `shared/utils/whatsapp-utils.ts` con `construirMensajeRecordatorio()` y `construirWhatsAppLink()` (enlace `wa.me`).
- Nueva página `/recordatorios` (`RecordatoriosPageComponent`) con lista de pendientes, envío individual y masivo, y toast de confirmación.
- Badge "N pend." en el sidebar que cuenta los turnos pendientes por enviar.
- El envío abre `wa.me` en pestaña nueva y marca el turno como recordatorio enviado.